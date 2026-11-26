import { describe, expect, it } from 'vitest'
import type { PostingDraftFieldsFragment } from '@/gql/graphql'
import { toDraftStepInput } from './postingDraftInput'
import {
  getSavedPositions,
  hasDetachedQuestions,
  toPostingCreateValues,
} from './postingDraftValues'

const EMPTY_DRAFT = {
  id: 'posting-1',
  status: 'DRAFT',
  hasInterview: true,
  updatedAt: '2026-11-24T14:32:00+09:00',
  organization: { id: 'org-1' },
  title: '',
  images: [],
  region: null,
  fee: null,
  allowEnrolled: false,
  allowOnLeave: false,
  eligibilityNote: null,
  content: null,
  recruitStartAt: null,
  recruitEndAt: null,
  activityStartedOn: null,
  activityEndedOn: null,
  noPosition: false,
  positions: [],
  questions: [],
  interviewMinutes: null,
  breakMinutes: null,
  interviewTimeRanges: [],
  maxApplicantsPerInterview: null,
  maxParallelInterviews: null,
} satisfies PostingDraftFieldsFragment

const FILLED_DRAFT = {
  ...EMPTY_DRAFT,
  title: 'UXUX 14기 신입 부원 모집',
  images: [
    { id: 'i2', url: 'https://cdn/second.png', isRepresentative: false, sortOrder: 1 },
    { id: 'i1', url: 'https://cdn/main.png', isRepresentative: true, sortOrder: 0 },
  ],
  fee: '30000',
  allowEnrolled: true,
  eligibilityNote: '졸업 예정자 가능',
  content: '<p>함께해요</p>',
  recruitStartAt: '2026-10-01T00:00:00+09:00',
  // UTC로 와도 한국 시각으로 복원
  recruitEndAt: '2026-10-07T09:00:00Z',
  positions: [
    { id: 'p2', name: '개발팀', sortOrder: 1 },
    { id: 'p1', name: '디자인팀', sortOrder: 0 },
  ],
  questions: [
    {
      id: 'q2',
      position: { id: 'p1' },
      type: 'FILE_LINK',
      title: '포트폴리오',
      description: null,
      required: false,
      maxLength: null,
      sortOrder: 1,
    },
    {
      id: 'q1',
      position: { id: 'p1' },
      type: 'TEXT',
      title: '자기소개',
      description: '편하게 적어 주세요',
      required: true,
      maxLength: 700,
      sortOrder: 0,
    },
    {
      id: 'q3',
      position: { id: 'p2' },
      type: 'TEXT',
      title: '지원 동기',
      description: null,
      required: true,
      maxLength: null,
      sortOrder: 0,
    },
    {
      id: 'q-old',
      position: { id: 'p2' },
      type: 'SINGLE_CHOICE',
      title: '예전 선택형',
      description: null,
      required: true,
      maxLength: null,
      sortOrder: 1,
    },
  ],
  interviewMinutes: 30,
  breakMinutes: 0,
  interviewTimeRanges: [
    { id: 't2', date: '2026-10-13', startTime: '13:00', endTime: '13:30' },
    { id: 't1', date: '2026-10-12', startTime: '09:00:00', endTime: '10:00:00' },
  ],
  maxApplicantsPerInterview: 2,
  // 선택지에 없는 값은 미선택으로
  maxParallelInterviews: 9,
} satisfies PostingDraftFieldsFragment

describe('toPostingCreateValues', () => {
  it('빈 초안은 빈 폼 값, 모집 유형 미선택', () => {
    const values = toPostingCreateValues(EMPTY_DRAFT)

    expect(values.title).toBe('')
    expect(values.savedMainImageUrl).toBeNull()
    expect(values.recruitType).toBeNull()
    expect(values.questionSets).toEqual([])
    expect(values.recruitStartDate).toBeNull()
    expect(values.interviewDates).toEqual([])
  })

  it('공고 정보: 대표 이미지 주소, 공개 항목·지원 자격 체크 복원', () => {
    expect(toPostingCreateValues(FILLED_DRAFT)).toMatchObject({
      title: 'UXUX 14기 신입 부원 모집',
      savedMainImageUrl: 'https://cdn/main.png',
      mainImage: null,
      publicItems: ['fee'],
      region: '',
      fee: '30000',
      qualifications: ['student', 'custom'],
      customQualification: '졸업 예정자 가능',
      content: '<p>함께해요</p>',
    })
  })

  it('모집 일정: 한국 날짜·시각으로 나눠 복원, 서버에 없는 발표일은 빈 값', () => {
    expect(toPostingCreateValues(FILLED_DRAFT)).toMatchObject({
      recruitStartDate: '2026-10-01',
      recruitStartTime: '00:00',
      recruitEndDate: '2026-10-07',
      recruitEndTime: '18:00',
      documentResultDate: null,
      finalResultDate: null,
    })
  })

  it('포지션·문항: 순서대로 정렬해 포지션별 묶음, 화면에 없는 유형 문항은 제외', () => {
    const values = toPostingCreateValues(FILLED_DRAFT)

    expect(values.recruitType).toBe('position')
    expect(values.positions).toEqual([{ name: '디자인팀' }, { name: '개발팀' }])
    const [designSet, devSet] = values.questionSets

    expect(designSet?.questions).toMatchObject([
      { id: 'q1', type: 'text', maxLength: '700', description: '편하게 적어 주세요' },
      { id: 'q2', type: 'file', isRequired: false },
    ])
    expect(devSet?.questions.map((question) => question.id)).toEqual(['q3'])
  })

  it('포지션 연결이 끊긴 문항은 지워지지 않도록 첫 포지션 묶음에 복원', () => {
    const values = toPostingCreateValues({
      ...FILLED_DRAFT,
      questions: FILLED_DRAFT.questions.map((question) =>
        question.id === 'q3' ? { ...question, position: null } : question,
      ),
    })
    const [designSet, devSet] = values.questionSets

    expect(designSet?.questions.map((question) => question.id)).toEqual(['q1', 'q3', 'q2'])
    expect(devSet?.questions).toEqual([])
  })

  it('통합 모집은 문항 묶음 하나', () => {
    const values = toPostingCreateValues({
      ...FILLED_DRAFT,
      noPosition: true,
      positions: [],
      questions: FILLED_DRAFT.questions.map((question) => ({ ...question, position: null })),
    })

    expect(values.recruitType).toBe('integrated')
    expect(values.questionSets).toHaveLength(1)
    expect(values.questionSets[0]?.questions.map((question) => question.id)).toEqual([
      'q1',
      'q3',
      'q2',
    ])
  })

  it('면접 시간: 블록을 30분 칸으로, 날짜는 시간대에서, 선택지에 없는 값은 미선택', () => {
    expect(toPostingCreateValues(FILLED_DRAFT)).toMatchObject({
      interviewDuration: '30',
      interviewBreak: '0',
      interviewDates: ['2026-10-12', '2026-10-13'],
      interviewSlots: ['2026-10-12T09:00', '2026-10-12T09:30', '2026-10-13T13:00'],
      interviewApplicantCount: '2',
      interviewRoomCount: null,
    })
  })

  it('불러온 값을 다시 저장 입력으로 바꾸면 서버 값과 같음', () => {
    const values = toPostingCreateValues(FILLED_DRAFT)
    const context = { savedPositions: getSavedPositions(FILLED_DRAFT) }

    expect(toDraftStepInput('schedule', values, true, context)).toMatchObject({
      recruitStartAt: FILLED_DRAFT.recruitStartAt,
      recruitEndAt: '2026-10-07T18:00:00+09:00',
    })
    expect(toDraftStepInput('interview', values, true, context).interviewTimeRanges).toEqual([
      { positionId: null, date: '2026-10-12', startTime: '09:00', endTime: '10:00' },
      { positionId: null, date: '2026-10-13', startTime: '13:00', endTime: '13:30' },
    ])
    expect(
      toDraftStepInput('form', values, true, context).questions?.map(({ title, positionId }) => ({
        title,
        positionId,
      })),
    ).toEqual([
      { title: '자기소개', positionId: 'p1' },
      { title: '포트폴리오', positionId: 'p1' },
      { title: '지원 동기', positionId: 'p2' },
    ])
  })
})

describe('getSavedPositions', () => {
  it('저장된 포지션 id와 이름을 순서대로', () => {
    expect(getSavedPositions(FILLED_DRAFT)).toEqual([
      { id: 'p1', name: '디자인팀' },
      { id: 'p2', name: '개발팀' },
    ])
  })
})

describe('hasDetachedQuestions', () => {
  it('포지션별 모집에서 포지션 연결이 끊긴 문항이 있으면 true', () => {
    const detached = {
      ...FILLED_DRAFT,
      questions: FILLED_DRAFT.questions.map((question) => ({ ...question, position: null })),
    }

    expect(hasDetachedQuestions(detached)).toBe(true)
    expect(hasDetachedQuestions(FILLED_DRAFT)).toBe(false)
  })

  it('통합 모집이거나 포지션이 없으면 공통 문항이 정상이라 false', () => {
    const integrated = {
      ...FILLED_DRAFT,
      noPosition: true,
      positions: [],
      questions: FILLED_DRAFT.questions.map((question) => ({ ...question, position: null })),
    }

    expect(hasDetachedQuestions(integrated)).toBe(false)
  })
})
