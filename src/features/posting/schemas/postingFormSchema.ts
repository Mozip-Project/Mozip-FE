import { z } from 'zod'

const QUESTION_TYPES = ['text', 'activity', 'file'] as const
const FILE_TYPES = ['pdf', 'image', 'ppt', 'mp4'] as const
const ACTIVITY_FIELDS = ['period', 'role', 'achievement'] as const

const postingQuestionSchema = z.object({
  id: z.string(),
  type: z.enum(QUESTION_TYPES),
  title: z.string(),
  description: z.string(),
  maxLength: z.string(),
  isRequired: z.boolean(),
  acceptsFile: z.boolean(),
  acceptsLink: z.boolean(),
  fileTypes: z.array(z.enum(FILE_TYPES)),
  activityFields: z.array(z.enum(ACTIVITY_FIELDS)),
  maxActivityCount: z.number(),
})

const postingFormSchema = z.object({
  requiresProfilePhoto: z.boolean(),
  questionSets: z.array(z.object({ questions: z.array(postingQuestionSchema) })),
})

type PostingQuestion = z.infer<typeof postingQuestionSchema>
type PostingQuestionType = (typeof QUESTION_TYPES)[number]
type PostingFileType = (typeof FILE_TYPES)[number]
type PostingActivityField = (typeof ACTIVITY_FIELDS)[number]
type PostingFormValues = z.infer<typeof postingFormSchema>
type PostingQuestionSet = PostingFormValues['questionSets'][number]

const EMPTY_POSTING_FORM = {
  requiresProfilePhoto: true,
  questionSets: [],
} satisfies PostingFormValues

const requiredPostingFormSchema = postingFormSchema.superRefine(({ questionSets }, context) => {
  questionSets.forEach(({ questions }, setIndex) => {
    questions.forEach((question, questionIndex) => {
      const path = ['questionSets', setIndex, 'questions', questionIndex]

      if (!question.title.trim()) {
        context.addIssue({
          code: 'custom',
          path: [...path, 'title'],
          message: '질문을 입력해 주세요',
        })
      }
      if (question.type === 'text' && !(Number(question.maxLength) > 0)) {
        context.addIssue({
          code: 'custom',
          path: [...path, 'maxLength'],
          message: '최대 글자 수를 입력해 주세요',
        })
      }
      if (question.type === 'file' && !question.acceptsFile && !question.acceptsLink) {
        context.addIssue({
          code: 'custom',
          path: [...path, 'acceptsFile'],
          message: '받는 방식을 선택해 주세요',
        })
      }
      if (question.type === 'file' && question.acceptsFile && question.fileTypes.length === 0) {
        context.addIssue({
          code: 'custom',
          path: [...path, 'fileTypes'],
          message: '허용 파일 방식을 선택해 주세요',
        })
      }
    })
  })
})

export {
  ACTIVITY_FIELDS,
  EMPTY_POSTING_FORM,
  FILE_TYPES,
  QUESTION_TYPES,
  requiredPostingFormSchema as postingFormSchema,
}
export type {
  PostingActivityField,
  PostingFileType,
  PostingFormValues,
  PostingQuestion,
  PostingQuestionSet,
  PostingQuestionType,
}
