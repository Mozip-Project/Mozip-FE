import { describe, expect, it } from 'vitest'
import type { PostingPosition, PostingQuestion } from '@/features/posting/types'
import {
  getLatestDraft,
  toApplicationFormInitialValues,
  type MyApplicationResponse,
} from './applicationDraft'

const BASE = { description: null, isRequired: true }

const COMMON_QUESTION: PostingQuestion = {
  ...BASE,
  id: 'motivation',
  title: '지원 동기',
  type: 'text',
  maxLength: 500,
}

const PLANNING_QUESTIONS: PostingQuestion[] = [
  COMMON_QUESTION,
  {
    ...BASE,
    id: 'experience',
    title: '활동 경험',
    type: 'activity',
    activityFields: ['period', 'role'],
    maxActivityCount: 3,
  },
  {
    ...BASE,
    id: 'portfolio',
    title: '포트폴리오',
    type: 'file',
    acceptsFile: true,
    acceptsLink: true,
    fileTypes: ['pdf'],
  },
  {
    ...BASE,
    id: 'planning-interview-time',
    title: '면접 가능 시간 선택',
    type: 'availability',
    interviewSlots: ['2026-12-01T13:00', '2026-12-01T13:30'],
  },
]

function createPositions(planningAppliedAt: string | null = null): PostingPosition[] {
  return [
    { id: 'design', name: '디자인', appliedAt: null, questions: [COMMON_QUESTION] },
    {
      id: 'planning',
      name: '기획',
      appliedAt: planningAppliedAt,
      questions: PLANNING_QUESTIONS,
    },
  ]
}

function createApplication(overrides: Partial<MyApplicationResponse> = {}): MyApplicationResponse {
  return {
    id: 'application-1',
    submittedAt: null,
    updatedAt: '2026-11-24T10:00:00+09:00',
    position: { id: 'planning' },
    availableTimes: [],
    answers: [],
    ...overrides,
  }
}

describe('getLatestDraft', () => {
  it('제출한 지원서는 빼고 가장 최근에 저장한 지원서를 고른다', () => {
    const latest = createApplication({ id: 'latest', updatedAt: '2026-11-24T12:00:00+09:00' })

    expect(
      getLatestDraft([
        createApplication({ id: 'old' }),
        createApplication({
          id: 'submitted',
          submittedAt: '2026-11-24T13:00:00+09:00',
          updatedAt: '2026-11-24T13:00:00+09:00',
        }),
        latest,
      ]),
    ).toBe(latest)
  })

  it('임시 저장한 지원서가 없으면 null', () => {
    expect(getLatestDraft([createApplication({ submittedAt: '2026-11-24T13:00:00+09:00' })])).toBe(
      null,
    )
  })
})

describe('toApplicationFormInitialValues', () => {
  it('임시 저장이 없으면 포지션을 고르지 않은 빈 답변으로 시작한다', () => {
    const values = toApplicationFormInitialValues({
      positions: createPositions(),
      questions: [],
      savedDraft: null,
    })

    expect(values.positionId).toBe('')
    expect(values.answers.texts).toEqual({ motivation: '' })
    expect(values.answers.activities.experience).toHaveLength(1)
  })

  it('임시 저장한 포지션과 문항 유형별 답변, 열린 면접 칸만 채운다', () => {
    const values = toApplicationFormInitialValues({
      positions: createPositions(),
      questions: [],
      savedDraft: createApplication({
        // UTC로 와도 한국 시각 칸으로 변환, 닫힌 14:00 칸은 제외
        availableTimes: [
          '2026-12-01T13:00:00+09:00',
          '2026-12-01T04:30:00Z',
          '2026-12-01T14:00:00+09:00',
        ],
        answers: [
          { question: { id: 'motivation' }, content: '지원 동기', attachments: [] },
          {
            question: { id: 'experience' },
            content: JSON.stringify([{ name: '동아리', period: '2025.03', role: '팀장' }]),
            attachments: [],
          },
          {
            question: { id: 'portfolio' },
            content: null,
            attachments: [
              { type: 'LINK', url: 'https://example.com' },
              { type: 'FILE', url: 'https://cdn.example.com/file.pdf' },
            ],
          },
          { question: { id: 'deleted-question' }, content: '삭제된 문항', attachments: [] },
        ],
      }),
    })

    expect(values.positionId).toBe('planning')
    expect(values.answers.texts).toEqual({ motivation: '지원 동기' })
    expect(values.answers.activities.experience).toEqual([
      {
        id: expect.any(String) as unknown,
        name: '동아리',
        period: '2025.03',
        role: '팀장',
        achievement: '',
      },
    ])
    expect(values.answers.files.portfolio).toEqual({
      files: [],
      links: [{ id: expect.any(String) as unknown, url: 'https://example.com' }],
    })
    expect(values.answers.availabilities).toEqual({
      'planning-interview-time': ['2026-12-01T13:00', '2026-12-01T13:30'],
    })
  })

  it('임시 저장한 포지션을 이미 제출했으면 포지션은 비워 둔다', () => {
    const values = toApplicationFormInitialValues({
      positions: createPositions('2026-11-24T13:00:00+09:00'),
      questions: [],
      savedDraft: createApplication({
        answers: [{ question: { id: 'motivation' }, content: '지원 동기', attachments: [] }],
      }),
    })

    expect(values.positionId).toBe('')
    expect(values.answers.texts).toEqual({ motivation: '지원 동기' })
  })

  it('활동 경험 JSON을 읽을 수 없으면 빈 항목 하나로 시작한다', () => {
    const values = toApplicationFormInitialValues({
      positions: createPositions(),
      questions: [],
      savedDraft: createApplication({
        answers: [{ question: { id: 'experience' }, content: '{잘못된', attachments: [] }],
      }),
    })

    expect(values.answers.activities.experience).toEqual([
      { id: expect.any(String) as unknown, name: '', period: '', role: '', achievement: '' },
    ])
  })
})
