import { describe, expect, it } from 'vitest'
import type { PostingApplicationFormQuery } from '@/gql/graphql'
import { markAppliedPositions, toApplicationFormPosting } from './applicationFormPosting'

type PostingResponse = PostingApplicationFormQuery['posting']
type QuestionResponse = PostingResponse['questions'][number]

function createQuestion(overrides: Partial<QuestionResponse> & { id: string }): QuestionResponse {
  return {
    type: 'TEXT',
    title: '지원 동기',
    description: null,
    required: true,
    maxLength: 500,
    sortOrder: 0,
    position: null,
    options: null,
    ...overrides,
  }
}

function createPosting(overrides: Partial<PostingResponse> = {}): PostingResponse {
  return {
    id: 'posting-1',
    title: '14기 모집',
    noPosition: true,
    hasInterview: false,
    profilePhotoRequired: false,
    positions: [],
    questions: [],
    interviewTimeRanges: [],
    ...overrides,
  }
}

describe('toApplicationFormPosting', () => {
  it('포지션 없는 모집은 문항을 sortOrder 순으로 바로 넘긴다', () => {
    const result = toApplicationFormPosting(
      createPosting({
        profilePhotoRequired: true,
        questions: [
          createQuestion({ id: 'second', sortOrder: 1 }),
          createQuestion({ id: 'first', sortOrder: 0 }),
        ],
      }),
    )

    expect(result.positions).toBeNull()
    expect(result.requiresProfilePhoto).toBe(true)
    expect(result.questions.map((question) => question.id)).toEqual(['first', 'second'])
  })

  it('포지션별 모집은 포지션마다 자기 문항과 공통 문항만 담는다', () => {
    const result = toApplicationFormPosting(
      createPosting({
        noPosition: false,
        positions: [
          { id: 'dev', name: '개발', sortOrder: 1 },
          { id: 'design', name: '디자인', sortOrder: 0 },
        ],
        questions: [
          createQuestion({ id: 'dev-q', position: { id: 'dev' } }),
          createQuestion({ id: 'design-q', position: { id: 'design' } }),
          createQuestion({ id: 'common-q', sortOrder: 1 }),
        ],
      }),
    )

    expect(result.questions).toEqual([])
    expect(
      result.positions?.map((position) => [position.id, position.questions.map((q) => q.id)]),
    ).toEqual([
      ['design', ['design-q', 'common-q']],
      ['dev', ['dev-q', 'common-q']],
    ])
  })

  it('문항 유형별 설정을 화면 값으로 바꾸고 지원하지 않는 유형은 뺀다', () => {
    const result = toApplicationFormPosting(
      createPosting({
        questions: [
          createQuestion({ id: 'text', maxLength: null }),
          createQuestion({
            id: 'activity',
            type: 'ACTIVITY',
            options: {
              activityFields: ['NAME', 'PERIOD', 'ACHIEVEMENT'],
              maxEntries: null,
              acceptFile: null,
              acceptLink: null,
              fileTypes: null,
            },
          }),
          createQuestion({
            id: 'file',
            type: 'FILE_LINK',
            options: {
              activityFields: null,
              maxEntries: null,
              acceptFile: true,
              acceptLink: null,
              fileTypes: ['PDF', 'MP4'],
            },
          }),
          createQuestion({ id: 'table', type: 'TABLE' }),
        ],
      }),
    )

    expect(result.questions).toEqual([
      expect.objectContaining({ id: 'text', type: 'text', maxLength: 500 }),
      expect.objectContaining({
        id: 'activity',
        type: 'activity',
        activityFields: ['period', 'achievement'],
        maxActivityCount: 3,
      }),
      expect.objectContaining({
        id: 'file',
        type: 'file',
        acceptsFile: true,
        acceptsLink: false,
        fileTypes: ['pdf', 'mp4'],
      }),
    ])
  })

  it('면접 있는 공고는 블록을 30분 칸으로 펼친 면접 가능 시간 문항을 마지막에 붙인다', () => {
    const result = toApplicationFormPosting(
      createPosting({
        hasInterview: true,
        questions: [createQuestion({ id: 'motivation' })],
        interviewTimeRanges: [
          {
            date: '2026-12-02',
            startTime: '10:00',
            endTime: '11:00',
            closedSlots: [],
            position: null,
          },
          {
            date: '2026-12-01',
            startTime: '13:00:00',
            endTime: '14:45:00',
            closedSlots: ['13:30:00'],
            position: null,
          },
        ],
      }),
    )

    expect(result.questions.at(-1)).toEqual(
      expect.objectContaining({
        id: 'interview-time',
        type: 'availability',
        interviewSlots: [
          '2026-12-01T13:00',
          '2026-12-01T14:00',
          '2026-12-02T10:00',
          '2026-12-02T10:30',
        ],
      }),
    )
  })

  it('포지션별 면접 시간은 그 포지션 블록과 공통 블록만 쓴다', () => {
    const result = toApplicationFormPosting(
      createPosting({
        noPosition: false,
        hasInterview: true,
        positions: [{ id: 'dev', name: '개발', sortOrder: 0 }],
        interviewTimeRanges: [
          {
            date: '2026-12-01',
            startTime: '10:00',
            endTime: '10:30',
            closedSlots: [],
            position: { id: 'dev' },
          },
          {
            date: '2026-12-01',
            startTime: '11:00',
            endTime: '11:30',
            closedSlots: [],
            position: { id: 'design' },
          },
          {
            date: '2026-12-01',
            startTime: '12:00',
            endTime: '12:30',
            closedSlots: [],
            position: null,
          },
        ],
      }),
    )

    expect(result.positions?.[0]?.questions).toEqual([
      expect.objectContaining({
        id: 'dev-interview-time',
        interviewSlots: ['2026-12-01T10:00', '2026-12-01T12:00'],
      }),
    ])
  })
})

describe('markAppliedPositions', () => {
  it('제출한 지원서의 포지션만 지원 완료로 표시하고 임시 저장·포지션 없는 지원서는 무시한다', () => {
    const positions = [
      { id: 'design', name: '디자인', appliedAt: null, questions: [] },
      { id: 'development', name: '개발', appliedAt: null, questions: [] },
      { id: 'planning', name: '기획', appliedAt: null, questions: [] },
    ]

    const result = markAppliedPositions(positions, [
      { submittedAt: '2026-11-12T10:00:00+09:00', position: { id: 'design' } },
      { submittedAt: null, position: { id: 'development' } },
      { submittedAt: '2026-11-12T10:00:00+09:00', position: null },
    ])

    expect(result.map(({ id, appliedAt }) => ({ id, appliedAt }))).toEqual([
      { id: 'design', appliedAt: '2026-11-12T10:00:00+09:00' },
      { id: 'development', appliedAt: null },
      { id: 'planning', appliedAt: null },
    ])
  })
})
