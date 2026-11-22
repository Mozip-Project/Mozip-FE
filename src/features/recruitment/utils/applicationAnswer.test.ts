import { describe, expect, it } from 'vitest'
import type { PostingQuestion } from '@/features/posting/types'
import {
  createEmptyApplicationAnswers,
  type FileAnswer,
} from '@/features/recruitment/schemas/applicationAnswerSchema'
import {
  hasOverLimitTextAnswer,
  hasValidFileAnswer,
  isTextAnswerOverLimit,
} from './applicationAnswer'

const BASE = { title: '문항', description: null, isRequired: true }
const TEXT_QUESTION = {
  ...BASE,
  id: 'motivation',
  type: 'text',
  maxLength: 5,
} satisfies PostingQuestion
const AVAILABILITY_QUESTION = {
  ...BASE,
  id: 'interview-time',
  type: 'availability',
  interviewSlots: ['2026-10-21T13:00'],
} satisfies PostingQuestion
const QUESTIONS = [TEXT_QUESTION, AVAILABILITY_QUESTION]

function createFile(name: string) {
  return new File(['내용'], name, { type: 'application/pdf' })
}

describe('isTextAnswerOverLimit', () => {
  it('최대 글자 수까지는 넘지 않음, 이모지는 한 글자로 셈', () => {
    expect(isTextAnswerOverLimit('가나다라마', 5)).toBe(false)
    expect(isTextAnswerOverLimit('가나다라마바', 5)).toBe(true)
    expect(isTextAnswerOverLimit('👍👍', 2)).toBe(false)
  })
})

describe('hasValidFileAnswer', () => {
  const RULE = { acceptsFile: true, acceptsLink: true }

  it('올린 파일이나 올바른 주소가 하나라도 있으면 답변으로 셈', () => {
    const withFile: FileAnswer = {
      files: [{ id: '1', file: createFile('a.pdf'), rejection: null }],
      links: [],
    }
    const withLink: FileAnswer = { files: [], links: [{ id: '1', url: 'behance.net/mozip' }] }

    expect(hasValidFileAnswer(withFile, RULE)).toBe(true)
    expect(hasValidFileAnswer(withLink, RULE)).toBe(true)
  })

  it('올리지 못한 파일·잘못된 주소만 있으면 답변이 아님', () => {
    const answer: FileAnswer = {
      files: [{ id: '1', file: createFile('a.pdf'), rejection: 'oversized' }],
      links: [{ id: '2', url: 'behance mozip' }],
    }

    expect(hasValidFileAnswer(answer, RULE)).toBe(false)
  })

  it('받지 않는 방식으로 올린 답변은 세지 않음', () => {
    const answer: FileAnswer = { files: [], links: [{ id: '1', url: 'behance.net/mozip' }] }

    expect(hasValidFileAnswer(answer, { acceptsFile: true, acceptsLink: false })).toBe(false)
  })
})

describe('hasOverLimitTextAnswer', () => {
  it('장문형 답변이 최대 글자 수 이내면 초과 없음', () => {
    const values = createEmptyApplicationAnswers(QUESTIONS)
    values.texts.motivation = '가나다라마'

    expect(hasOverLimitTextAnswer(QUESTIONS, values)).toBe(false)
  })

  it('장문형 답변 하나라도 최대 글자 수를 넘으면 초과', () => {
    const values = createEmptyApplicationAnswers(QUESTIONS)
    values.texts.motivation = '가나다라마바'

    expect(hasOverLimitTextAnswer(QUESTIONS, values)).toBe(true)
  })
})
