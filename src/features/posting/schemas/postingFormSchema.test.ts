import { describe, expect, it } from 'vitest'
import { createQuestion, resizeQuestionSets } from '@/features/posting/utils/postingQuestions'
import { EMPTY_POSTING_FORM, postingFormSchema, type PostingQuestionSet } from './postingFormSchema'

function isValid(questionSets: PostingQuestionSet[]) {
  return postingFormSchema.safeParse({ ...EMPTY_POSTING_FORM, questionSets }).success
}

describe('postingFormSchema', () => {
  it('기본 문항은 통과', () => {
    expect(isValid(resizeQuestionSets([], 3))).toBe(true)
  })

  it('질문이 비었거나 공백뿐이면 실패', () => {
    expect(isValid([{ questions: [createQuestion('activity')] }])).toBe(false)
    expect(isValid([{ questions: [createQuestion('file', '   ')] }])).toBe(false)
  })

  it('장문형은 최대 글자 수가 1 이상이어야 통과, 다른 유형은 무관', () => {
    const text = { ...createQuestion('text', '자기소개'), maxLength: '' }
    const file = {
      ...createQuestion('file', '포트폴리오'),
      maxLength: '',
      fileTypes: ['pdf' as const],
    }

    expect(isValid([{ questions: [text] }])).toBe(false)
    expect(isValid([{ questions: [{ ...text, maxLength: '0' }] }])).toBe(false)
    expect(isValid([{ questions: [{ ...text, maxLength: '300' }] }])).toBe(true)
    expect(isValid([{ questions: [file] }])).toBe(true)
  })

  it('파일 문항은 받는 방식이 하나 이상, 파일 업로드면 허용 파일 방식이 하나 이상이어야 통과', () => {
    const file = { ...createQuestion('file', '포트폴리오'), fileTypes: ['pdf' as const] }

    expect(isValid([{ questions: [createQuestion('file', '포트폴리오')] }])).toBe(false)

    expect(isValid([{ questions: [{ ...file, acceptsFile: false, acceptsLink: false }] }])).toBe(
      false,
    )
    expect(isValid([{ questions: [{ ...file, fileTypes: [] }] }])).toBe(false)
    expect(isValid([{ questions: [{ ...file, acceptsFile: false, fileTypes: [] }] }])).toBe(true)
  })
})
