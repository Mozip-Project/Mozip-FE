import { describe, expect, it } from 'vitest'
import type { PostingQuestion } from '@/features/posting/types'
import type { ApplicationAnswerValues } from '@/features/recruitment/schemas/applicationAnswerSchema'
import { toApplicationInput } from './applicationInput'

const BASE = { title: '문항', description: null, isRequired: true }

const ACTIVITY_QUESTION: PostingQuestion = {
  ...BASE,
  id: 'experience',
  type: 'activity',
  activityFields: ['period', 'achievement'],
  maxActivityCount: 3,
}

const QUESTIONS: PostingQuestion[] = [
  { ...BASE, id: 'motivation', type: 'text', maxLength: 500 },
  { ...BASE, id: 'empty-text', type: 'text', maxLength: 500 },
  ACTIVITY_QUESTION,
  {
    ...BASE,
    id: 'portfolio',
    type: 'file',
    acceptsFile: true,
    acceptsLink: true,
    fileTypes: ['pdf'],
  },
  {
    ...BASE,
    id: 'interview-time',
    type: 'availability',
    interviewSlots: ['2026-12-01T13:00', '2026-12-01T13:30'],
  },
]

function createAnswers(overrides: Partial<ApplicationAnswerValues> = {}): ApplicationAnswerValues {
  return { texts: {}, activities: {}, files: {}, availabilities: {}, ...overrides }
}

describe('toApplicationInput', () => {
  it('문항 유형별 답변을 저장 입력으로 바꾸고 면접 시간은 availableTimes로 보낸다', () => {
    const input = toApplicationInput({
      positionId: 'design',
      questions: QUESTIONS,
      answers: createAnswers({
        texts: { motivation: '지원 동기', 'empty-text': '' },
        activities: {
          experience: [
            { id: 'a', name: '동아리', period: '2025.03 ~ 2025.06', role: '팀장', achievement: '' },
            { id: 'b', name: '', period: '', role: '', achievement: '' },
          ],
        },
        files: {
          portfolio: {
            files: [],
            links: [
              { id: 'l1', url: 'behance.net/mozip' },
              { id: 'l2', url: '잘못된 주소' },
            ],
          },
        },
        availabilities: { 'interview-time': ['2026-12-01T13:30', '2026-12-01T13:00'] },
      }),
    })

    expect(input).toEqual({
      positionId: 'design',
      answers: [
        { questionId: 'motivation', content: '지원 동기' },
        { questionId: 'empty-text', content: null },
        {
          questionId: 'experience',
          content: JSON.stringify([
            { name: '동아리', period: '2025.03 ~ 2025.06', achievement: '' },
          ]),
        },
        { questionId: 'portfolio', attachments: [{ url: 'https://behance.net/mozip' }] },
      ],
      availableTimes: ['2026-12-01T13:30:00+09:00', '2026-12-01T13:00:00+09:00'],
    })
  })

  it('포지션을 고르지 않았거나 없는 모집이면 positionId null, 면접 문항이 없으면 availableTimes null', () => {
    const input = toApplicationInput({
      positionId: '',
      questions: [ACTIVITY_QUESTION],
      answers: createAnswers(),
    })

    expect(input).toEqual({
      positionId: null,
      answers: [{ questionId: 'experience', content: null }],
      availableTimes: null,
    })
  })
})
