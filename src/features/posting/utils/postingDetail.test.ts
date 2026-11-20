import { describe, expect, it } from 'vitest'
import type { PostingDetail } from '@/features/posting/types'
import {
  getDeadlineUrgency,
  getPostingFactRows,
  getPostingRecruitmentPhase,
  getPostingScheduleRows,
  getRecruitmentStatusLabel,
} from './postingDetail'

const STARTS_AT = '2026-10-01T00:00:00+09:00'
const ENDS_AT = '2026-10-15T23:59:59+09:00'

const BASE_DETAIL = {
  id: 'posting',
  title: 'UXUX 14기 신입 부원 모집',
  organization: {
    name: 'UXUX',
    logoUrl: null,
    activityType: 'club',
    scope: 'campus',
    introduction: '',
    activityFields: [],
    keywords: [],
    links: [],
    ongoingPostings: [],
  },
  interview: { method: '대면', startDate: '2026-10-21', endDate: '2026-10-23' },
  eligibility: '대학생 · 휴학생',
  activityArea: '신촌 · 온라인 병행',
  membershipFee: '학기당 30,000원',
  recruitmentStartsAt: STARTS_AT,
  recruitmentEndsAt: ENDS_AT,
  documentResultDate: '2026-10-18',
  finalResultDate: '2026-10-27',
  coverImage: null,
  content: [],
  questions: [],
  application: { type: 'direct', appliedAt: null },
} satisfies PostingDetail

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

  it('입력하지 않은 활동 지역·회비는 행 생략', () => {
    const detail = {
      ...BASE_DETAIL,
      activityArea: null,
      membershipFee: null,
    } satisfies PostingDetail

    expect(getPostingFactRows(detail).map(({ label }) => label)).toEqual(['면접', '지원 자격'])
  })

  it('포지션 있는 모집은 맨 앞에 모집 포지션 표시', () => {
    const positions = [
      { id: 'design', name: '디자인', appliedAt: '2026-10-03', questions: [] },
      { id: 'dev', name: '개발', appliedAt: null, questions: [] },
    ]
    const rows = getPostingFactRows({
      ...BASE_DETAIL,
      application: { type: 'byPosition', positions },
    })

    expect(rows.map(({ label }) => label)).toEqual([
      '모집 포지션',
      '면접',
      '지원 자격',
      '활동 지역',
      '회비',
    ])
    expect(rows[0]).toEqual({ label: '모집 포지션', positions })
  })

  it('포지션 목록이 비면 모집 포지션 행 생략', () => {
    const rows = getPostingFactRows({
      ...BASE_DETAIL,
      application: { type: 'byPosition', positions: [] },
    })

    expect(rows.map(({ label }) => label)).not.toContain('모집 포지션')
  })

  it('면접 없는 모집은 없음으로 표시', () => {
    expect(getPostingFactRows({ ...BASE_DETAIL, interview: null })[0]).toEqual({
      label: '면접',
      value: '없음',
    })
  })
})

describe('getPostingScheduleRows', () => {
  it('면접 있는 모집은 지원 기간·서류 결과·면접 기간·최종 결과 표시', () => {
    expect(getPostingScheduleRows(BASE_DETAIL)).toEqual([
      { label: '지원 기간', value: '10/1 (목) 00:00 ~ 10/15 (목) 23:59' },
      { label: '서류 결과', value: '10/18 (일)' },
      { label: '면접 기간', value: '10/21 (수) ~ 10/23 (금)' },
      { label: '최종 결과', value: '10/27 (화)' },
    ])
  })

  it('입력하지 않은 서류 결과는 행 생략, 최종 결과는 추후 안내', () => {
    const detail = {
      ...BASE_DETAIL,
      documentResultDate: null,
      finalResultDate: null,
    } satisfies PostingDetail

    expect(getPostingScheduleRows(detail)).toEqual([
      { label: '지원 기간', value: '10/1 (목) 00:00 ~ 10/15 (목) 23:59' },
      { label: '면접 기간', value: '10/21 (수) ~ 10/23 (금)' },
      { label: '최종 결과', value: '추후 안내' },
    ])
  })

  it('면접 없는 모집은 지원 기간·결과 발표만 표시', () => {
    expect(getPostingScheduleRows({ ...BASE_DETAIL, interview: null })).toEqual([
      { label: '지원 기간', value: '10/1 (목) 00:00 ~ 10/15 (목) 23:59' },
      { label: '결과 발표', value: '10/27 (화)' },
    ])
  })
})

describe('getRecruitmentStatusLabel', () => {
  it('모집 중이면 마감까지 남은 날, 마감 당일은 D-day', () => {
    expect(getRecruitmentStatusLabel({ status: 'open', daysLeft: 1 })).toBe('마감 D-1')
    expect(getRecruitmentStatusLabel({ status: 'open', daysLeft: 0 })).toBe('마감 D-day')
  })

  it('모집 예정이면 시작까지 남은 날', () => {
    expect(getRecruitmentStatusLabel({ status: 'upcoming', daysLeft: 3 })).toBe('모집 예정 D-3')
  })

  it('마감 후에는 남은 날 없이 모집 마감', () => {
    expect(getRecruitmentStatusLabel({ status: 'closed' })).toBe('모집 마감')
  })
})

describe('getDeadlineUrgency', () => {
  it('D-day와 D-1은 임박', () => {
    expect(getDeadlineUrgency(0)).toBe('imminent')
    expect(getDeadlineUrgency(1)).toBe('imminent')
  })

  it('D-2부터 D-5까지는 가까움', () => {
    expect(getDeadlineUrgency(2)).toBe('soon')
    expect(getDeadlineUrgency(5)).toBe('soon')
  })

  it('D-6부터는 여유', () => {
    expect(getDeadlineUrgency(6)).toBe('relaxed')
    expect(getDeadlineUrgency(30)).toBe('relaxed')
  })
})
