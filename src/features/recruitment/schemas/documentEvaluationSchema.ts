import { z } from 'zod'

const OPINIONS = ['pass', 'hold', 'fail'] as const

const SCORE_REQUIRED_MESSAGE = '점수를 선택해 주세요'

const documentEvaluationSchema = z.object({
  opinion: z.enum(OPINIONS).or(z.literal('')),
  scores: z.record(z.string(), z.string().optional()),
  memo: z.string(),
})

function createSubmitSchema(scoreQuestionIds: readonly string[]) {
  return documentEvaluationSchema.superRefine(({ scores }, context) => {
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
