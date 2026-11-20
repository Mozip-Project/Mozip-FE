import { describe, expect, it } from 'vitest'
import { postingFormSchema } from '@/features/posting/schemas/postingFormSchema'
import { createTemplateQuestions, QUESTION_TEMPLATE_IDS } from './postingQuestionTemplates'

describe('createTemplateQuestions', () => {
  it.each(QUESTION_TEMPLATE_IDS)(
    '%s 템플릿은 필수 문항 3개로 바로 다음 단계 조건 통과',
    (templateId) => {
      const questions = createTemplateQuestions(templateId)

      expect(questions).toHaveLength(3)
      expect(questions.every((question) => question.isRequired)).toBe(true)
      expect(
        postingFormSchema.safeParse({ requiresProfilePhoto: true, questionSets: [{ questions }] })
          .success,
      ).toBe(true)
    },
  )

  it('포트폴리오형은 파일 문항 다음 700자·300자 장문형', () => {
    expect(
      createTemplateQuestions('portfolio').map(({ type, maxLength }) => [type, maxLength]),
    ).toEqual([
      ['file', '500'],
      ['text', '700'],
      ['text', '300'],
    ])
    expect(createTemplateQuestions('portfolio')[0]).toMatchObject({
      acceptsFile: true,
      acceptsLink: true,
      fileTypes: ['pdf', 'image'],
    })
  })

  it('만들 때마다 새 id 부여', () => {
    const [first] = createTemplateQuestions('teamwork')
    const [second] = createTemplateQuestions('teamwork')

    expect(first?.id).not.toBe(second?.id)
  })
})
