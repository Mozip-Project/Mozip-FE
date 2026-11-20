import { describe, expect, it } from 'vitest'
import { createQuestion, resizeQuestionSets } from './postingQuestions'

describe('createQuestion', () => {
  it('유형별 새 문항은 빈 질문, 필수, 500자로 시작하고 id가 서로 다름', () => {
    const first = createQuestion('activity')
    const second = createQuestion('activity')

    expect(first).toMatchObject({ type: 'activity', title: '', maxLength: '500', isRequired: true })
    expect(first.id).not.toBe(second.id)
  })
})

describe('resizeQuestionSets', () => {
  it('비어 있으면 세트마다 기본 장문형 문항 3개를 서로 다른 id로 생성', () => {
    const sets = resizeQuestionSets([], 2)

    expect(sets).toHaveLength(2)
    expect(sets[0]?.questions.map((question) => question.title)).toEqual([
      '자기소개를 해 주세요',
      '지원 동기를 작성해 주세요',
      '지원 분야와 관련된 경험을 알려 주세요',
    ])
    expect(sets.flatMap((set) => set.questions).every((question) => question.type === 'text')).toBe(
      true,
    )
    expect(new Set(sets.flatMap((set) => set.questions.map((question) => question.id))).size).toBe(
      6,
    )
  })

  it('기존 세트는 그대로 두고 늘어난 만큼만 추가, 줄어든 만큼 제거', () => {
    const existing = { questions: [createQuestion('file', '포트폴리오')] }

    expect(resizeQuestionSets([existing], 2)[0]).toBe(existing)
    expect(resizeQuestionSets([existing], 2)[1]?.questions).toHaveLength(3)
    expect(resizeQuestionSets([existing, existing], 1)).toEqual([existing])
  })
})
