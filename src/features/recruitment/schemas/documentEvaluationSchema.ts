import { z } from 'zod'

const OPINIONS = ['pass', 'hold', 'fail'] as const

const SCORE_REQUIRED_MESSAGE = '점수를 선택해 주세요'
const OPINION_REQUIRED_MESSAGE = '의견을 선택해 주세요'

const documentEvaluationSchema = z.object({
  opinion: z.enum(OPINIONS).or(z.literal('')),
  scores: z.record(z.string(), z.string().optional()),
  memo: z.string(),
})

// 저장 버튼(submit true)은 의견과 모든 문항 점수 필수, 메모는 선택
function createSubmitSchema(scoreQuestionIds: readonly string[]) {
  return documentEvaluationSchema.superRefine(({ opinion, scores }, context) => {
    if (opinion === '') {
      context.addIssue({ code: 'custom', path: ['opinion'], message: OPINION_REQUIRED_MESSAGE })
    }
    for (const questionId of scoreQuestionIds) {
      if (!scores[questionId]) {
        context.addIssue({
          code: 'custom',
          path: ['scores', questionId],
          message: SCORE_REQUIRED_MESSAGE,
        })
      }
    }
  })
}

type Opinion = (typeof OPINIONS)[number]
type DocumentEvaluationValues = z.infer<typeof documentEvaluationSchema>

export { OPINIONS, createSubmitSchema, documentEvaluationSchema }
export type { DocumentEvaluationValues, Opinion }
