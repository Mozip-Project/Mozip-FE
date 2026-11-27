import { describe, expect, it } from 'vitest'
import type { PostingDetail } from '@/features/posting/types'
import type { PostingQuery } from '@/gql/graphql'
import {
  getPostingFactRows,
  getPostingRecruitmentPhase,
  getPostingScheduleRows,
  toPostingDetail,
} from './postingDetail'

const STARTS_AT = '2026-10-01T00:00:00+09:00'
const ENDS_AT = '2026-10-15T23:59:59+09:00'

const BASE_DETAIL = {
  id: 'posting',
  title: 'UXUX 14기 신입 부원 모집',
  organization: {
    name: 'UXUX',
    logoUrl: null,
    type: 'CLUB',
    tagline: null,
    fields: [],
    keywords: [],
    links: [],
    ongoingPostings: [],
  },
  hasInterview: true,
  interviewPeriod: { startDate: '2026-10-21', endDate: '2026-10-23' },
  eligibility: '대학생 · 휴학생',
  activityArea: '신촌 · 온라인 병행',
  membershipFee: '학기당 30,000원',
  recruitmentStartsAt: STARTS_AT,
  recruitmentEndsAt: ENDS_AT,
  documentResultDate: '2026-10-18',
  finalResultDate: '2026-10-27',
  coverImageUrl: null,
  content: [],
  positions: [],
  questions: [],
} satisfies PostingDetail

const BASE_RESPONSE = {
  id: 'posting',
  title: 'UXUX 14기 신입 부원 모집',
  content: '<p>본문</p>',
  noPosition: false,
  hasInterview: true,
  allowEnrolled: true,
  allowOnLeave: true,
  eligibilityNote: null,
  region: null,
  fee: null,
  recruitStartAt: STARTS_AT,
  recruitEndAt: ENDS_AT,
  docResultAt: null,
  finalResultAt: null,
  images: [],
  positions: [],
  questions: [],
  interviewTimeRanges: [],
  organization: {
    name: 'UXUX',
    type: 'CLUB',
    logoUrl: null,
    tagline: null,
    keywords: [],
    fields: [],
    links: [],
  },
  otherActivePostings: [],
} satisfies PostingQuery['posting']

describe('getPostingRecruitmentPhase', () => {
  it('시작 전이면 시작일까지 남은 날로 모집 예정', () => {
    expect(
      getPostingRecruitmentPhase(STARTS_AT, ENDS_AT, new Date('2026-09-28T12:00:00+09:00')),
    ).toEqual({ status: 'upcoming', daysLeft: 3 })
  })

  it('시작 당일 시작 시각 전이면 모집 예정 D-day', () => {
    expect(
      getPostingRecruitmentPhase(
        '2026-10-01T10:00:00+09:00',
        ENDS_AT,
        new Date('2026-10-01T09:00:00+09:00'),
      ),
    ).toEqual({ status: 'upcoming', daysLeft: 0 })
  })

  it('시작 시각부터 마감일까지 남은 날로 모집 중', () => {
    expect(getPostingRecruitmentPhase(STARTS_AT, ENDS_AT, new Date(STARTS_AT))).toEqual({
      status: 'open',
      daysLeft: 14,
    })
    expect(
      getPostingRecruitmentPhase(STARTS_AT, ENDS_AT, new Date('2026-10-14T23:59:59+09:00')),
    ).toEqual({ status: 'open', daysLeft: 1 })
  })

  it('마감 당일은 마감 시각까지 D-day', () => {
    expect(
      getPostingRecruitmentPhase(STARTS_AT, ENDS_AT, new Date('2026-10-15T00:00:00+09:00')),
    ).toEqual({ status: 'open', daysLeft: 0 })
    expect(getPostingRecruitmentPhase(STARTS_AT, ENDS_AT, new Date(ENDS_AT))).toEqual({
      status: 'open',
      daysLeft: 0,
    })
  })

  it('마감 시각이 지나면 모집 마감', () => {
    expect(
      getPostingRecruitmentPhase(STARTS_AT, ENDS_AT, new Date('2026-10-16T00:00:00+09:00')),
    ).toEqual({ status: 'closed' })
  })

  it('남은 날은 서버 시간대가 아니라 한국 날짜 기준', () => {
    // UTC 10/14 15:00 = 한국 10/15 00:00
    expect(
      getPostingRecruitmentPhase(STARTS_AT, ENDS_AT, new Date('2026-10-14T15:00:00Z')),
    ).toEqual({ status: 'open', daysLeft: 0 })
  })

  it('마감 시각이 UTC 표기여도 한국 날짜로 남은 날 계산', () => {
    // UTC 10/15 15:00 = 한국 10/16 00:00
    expect(
      getPostingRecruitmentPhase(
        STARTS_AT,
        '2026-10-15T15:00:00Z',
        new Date('2026-10-15T10:00:00+09:00'),
      ),
    ).toEqual({ status: 'open', daysLeft: 1 })
  })

  it('시각을 읽을 수 없으면 지원을 막도록 모집 마감', () => {
    expect(getPostingRecruitmentPhase('미정', ENDS_AT, new Date(STARTS_AT))).toEqual({
      status: 'closed',
    })
  })

  it('시각이 없으면 지원을 막도록 모집 마감', () => {
    expect(getPostingRecruitmentPhase(null, ENDS_AT, new Date(STARTS_AT))).toEqual({
      status: 'closed',
    })
    expect(getPostingRecruitmentPhase(STARTS_AT, null, new Date(STARTS_AT))).toEqual({
      status: 'closed',
    })
  })
})

describe('toPostingDetail', () => {
  it('재학·휴학 허용 뒤 괄호에 직접 입력한 자격 표시', () => {
    expect(toPostingDetail({ ...BASE_RESPONSE, eligibilityNote: '1~3학년' }).eligibility).toBe(
      '대학생 · 휴학생 (1~3학년)',
    )
    expect(toPostingDetail({ ...BASE_RESPONSE, allowOnLeave: false }).eligibility).toBe('대학생')
  })

  it('숫자만 있는 회비는 천 단위 쉼표, 다른 형식은 그대로', () => {
    expect(toPostingDetail({ ...BASE_RESPONSE, fee: '20000' }).membershipFee).toBe('20,000')
    expect(toPostingDetail({ ...BASE_RESPONSE, fee: '학기당 30,000원' }).membershipFee).toBe(
      '학기당 30,000원',
    )
    expect(toPostingDetail(BASE_RESPONSE).membershipFee).toBeNull()
  })

  it('재학·휴학 모두 허용하지 않으면 직접 입력한 자격만, 둘 다 없으면 null', () => {
    const noStatus = { ...BASE_RESPONSE, allowEnrolled: false, allowOnLeave: false }

    expect(toPostingDetail({ ...noStatus, eligibilityNote: '졸업생' }).eligibility).toBe('졸업생')
    expect(toPostingDetail({ ...noStatus, eligibilityNote: ' ' }).eligibility).toBeNull()
  })

  it('면접 기간은 면접 가능 시간대 날짜의 처음과 끝', () => {
    const detail = toPostingDetail({
      ...BASE_RESPONSE,
      interviewTimeRanges: [{ date: '2026-10-23' }, { date: '2026-10-21' }, { date: '2026-10-22' }],
    })

    expect(detail.interviewPeriod).toEqual({ startDate: '2026-10-21', endDate: '2026-10-23' })
  })

  it('면접 없는 모집이나 시간대가 없으면 면접 기간 null', () => {
    const ranges = [{ date: '2026-10-21' }]

    expect(
      toPostingDetail({ ...BASE_RESPONSE, hasInterview: false, interviewTimeRanges: ranges })
        .interviewPeriod,
    ).toBeNull()
    expect(toPostingDetail(BASE_RESPONSE).interviewPeriod).toBeNull()
  })

  it('결과 발표 시각은 한국 날짜로 변환', () => {
    const detail = toPostingDetail({
      ...BASE_RESPONSE,
      // UTC 10/17 15:00 = 한국 10/18 00:00
      docResultAt: '2026-10-17T15:00:00Z',
      finalResultAt: '2026-10-27T18:00:00+09:00',
    })

    expect(detail.documentResultDate).toBe('2026-10-18')
    expect(detail.finalResultDate).toBe('2026-10-27')
  })

  it('대표 이미지가 없으면 순서가 가장 앞선 사진', () => {
    const images = [
      { url: 'https://example.com/second.png', isRepresentative: false, sortOrder: 1 },
      { url: 'https://example.com/first.png', isRepresentative: false, sortOrder: 0 },
    ]

    expect(toPostingDetail({ ...BASE_RESPONSE, images }).coverImageUrl).toBe(
      'https://example.com/first.png',
    )
    expect(
      toPostingDetail({
        ...BASE_RESPONSE,
        images: [
          ...images,
          { url: 'https://example.com/cover.png', isRepresentative: true, sortOrder: 2 },
        ],
      }).coverImageUrl,
    ).toBe('https://example.com/cover.png')
  })

  it('포지션별 문항은 공통 문항과 해당 포지션 문항을 순서대로, 면접 있으면 면접 가능 시간 추가', () => {
    const detail = toPostingDetail({
      ...BASE_RESPONSE,
      positions: [
        { id: 'dev', name: '개발', sortOrder: 1 },
        { id: 'design', name: '디자인', sortOrder: 0 },
      ],
      questions: [
        { id: 'portfolio', title: '포트폴리오', sortOrder: 2, position: { id: 'design' } },
        { id: 'motivation', title: '지원 동기', sortOrder: 0, position: null },
        { id: 'stack', title: '기술 스택', sortOrder: 1, position: { id: 'dev' } },
      ],
    })

    expect(detail.positions).toEqual([
      {
        id: 'design',
        name: '디자인',
        questions: [
          { id: 'motivation', title: '지원 동기' },
          { id: 'portfolio', title: '포트폴리오' },
          { id: 'interview-availability', title: '면접 가능 시간 선택' },
        ],
      },
      {
        id: 'dev',
        name: '개발',
        questions: [
          { id: 'motivation', title: '지원 동기' },
          { id: 'stack', title: '기술 스택' },
          { id: 'interview-availability', title: '면접 가능 시간 선택' },
        ],
      },
    ])
  })

  it('포지션 없는 모집은 포지션을 비우고 문항 전체 표시', () => {
    const detail = toPostingDetail({
      ...BASE_RESPONSE,
      noPosition: true,
      hasInterview: false,
      positions: [{ id: 'ignored', name: '무시', sortOrder: 0 }],
      questions: [{ id: 'motivation', title: '지원 동기', sortOrder: 0, position: null }],
    })

    expect(detail.positions).toEqual([])
    expect(detail.questions).toEqual([{ id: 'motivation', title: '지원 동기' }])
  })

  it('단체 링크는 주소만, 다른 공고는 화면 이름으로 변환', () => {
    const detail = toPostingDetail({
      ...BASE_RESPONSE,
      organization: {
        ...BASE_RESPONSE.organization,
        links: [{ id: 'link', url: 'https://example.com' }],
      },
      otherActivePostings: [
        { id: 'other', title: '다른 모집', recruitStartAt: STARTS_AT, recruitEndAt: ENDS_AT },
      ],
    })

    expect(detail.organization.links).toEqual(['https://example.com'])
    expect(detail.organization.ongoingPostings).toEqual([
      {
        postingId: 'other',
        title: '다른 모집',
        recruitmentStartsAt: STARTS_AT,
        recruitmentEndsAt: ENDS_AT,
      },
    ])
  })
})

describe('getPostingFactRows', () => {
  it('Figma 순서대로 핵심 정보 표시', () => {
    expect(getPostingFactRows(BASE_DETAIL)).toEqual([
      { label: '면접', value: '있음' },
      { label: '지원 자격', value: '대학생 · 휴학생' },
      { label: '활동 지역', value: '신촌 · 온라인 병행' },
      { label: '회비', value: '학기당 30,000원' },
    ])
  })

  it('입력하지 않은 지원 자격·활동 지역·회비는 행 생략', () => {
    const detail = {
      ...BASE_DETAIL,
      eligibility: null,
      activityArea: null,
      membershipFee: null,
    } satisfies PostingDetail

    expect(getPostingFactRows(detail).map(({ label }) => label)).toEqual(['면접'])
  })

  it('포지션 있는 모집은 맨 앞에 포지션 이름 표시', () => {
    const rows = getPostingFactRows({
      ...BASE_DETAIL,
      positions: [
        { id: 'design', name: '디자인', questions: [] },
        { id: 'dev', name: '개발', questions: [] },
      ],
    })

    expect(rows[0]).toEqual({ label: '모집 포지션', value: '디자인, 개발' })
  })

  it('포지션 없는 모집은 모집 포지션 행 생략', () => {
    expect(getPostingFactRows(BASE_DETAIL).map(({ label }) => label)).not.toContain('모집 포지션')
  })

  it('면접 없는 모집은 없음으로 표시', () => {
    expect(getPostingFactRows({ ...BASE_DETAIL, hasInterview: false })[0]).toEqual({
      label: '면접',
      value: '없음',
    })
  })
})

describe('getPostingScheduleRows', () => {
  it('면접 있는 모집은 모집 기간·서류 결과·면접 기간·최종 결과 표시', () => {
    expect(getPostingScheduleRows(BASE_DETAIL)).toEqual([
      { label: '모집 기간', value: '10/1 (목) 00:00 ~ 10/15 (목) 23:59' },
      { label: '서류 결과', value: '10/18 (일)' },
      { label: '면접 기간', value: '10/21 (수) ~ 10/23 (금)' },
      { label: '최종 결과', value: '10/27 (화)' },
    ])
  })

  it('입력하지 않은 서류 결과·면접 기간은 행 생략, 최종 결과는 추후 안내', () => {
    const detail = {
      ...BASE_DETAIL,
      interviewPeriod: null,
      documentResultDate: null,
      finalResultDate: null,
    } satisfies PostingDetail

    expect(getPostingScheduleRows(detail)).toEqual([
      { label: '모집 기간', value: '10/1 (목) 00:00 ~ 10/15 (목) 23:59' },
      { label: '최종 결과', value: '추후 안내' },
    ])
  })

  it('면접 없는 모집은 모집 기간과 서류 결과일을 결과 발표로 표시', () => {
    expect(
      getPostingScheduleRows({ ...BASE_DETAIL, hasInterview: false, interviewPeriod: null }),
    ).toEqual([
      { label: '모집 기간', value: '10/1 (목) 00:00 ~ 10/15 (목) 23:59' },
      { label: '결과 발표', value: '10/18 (일)' },
    ])
  })

  it('면접 없는 모집의 결과 발표일이 없으면 추후 안내', () => {
    expect(
      getPostingScheduleRows({ ...BASE_DETAIL, hasInterview: false, documentResultDate: null })[1],
    ).toEqual({ label: '결과 발표', value: '추후 안내' })
  })

  it('모집 시작·마감 시각이 없으면 모집 기간 생략', () => {
    expect(
      getPostingScheduleRows({ ...BASE_DETAIL, recruitmentStartsAt: null }).map(
        ({ label }) => label,
      ),
    ).not.toContain('모집 기간')
  })
})
