import { z } from 'zod'

const RESULT_NOTICE_BODY_MAX_LENGTH = 1000

// 공백만 입력한 경우도 빈 값으로 처리, 입력값 자체는 바꾸지 않도록 trim 변환 대신 검사만
function isFilled(value: string) {
  return value.trim() !== ''
}

const resultNoticeMessageSchema = z.object({
  subject: z.string().refine(isFilled, '메일 제목을 입력해 주세요'),
  body: z.string().refine(isFilled, '본문을 입력해 주세요'),
})

const resultNoticeFormSchema = z.object({
  pass: resultNoticeMessageSchema,
  fail: resultNoticeMessageSchema,
})

type ResultNoticeMessageValues = z.infer<typeof resultNoticeMessageSchema>
type ResultNoticeFormValues = z.infer<typeof resultNoticeFormSchema>

export {
  isFilled,
  RESULT_NOTICE_BODY_MAX_LENGTH,
  resultNoticeFormSchema,
  resultNoticeMessageSchema,
}
export type { ResultNoticeFormValues, ResultNoticeMessageValues }
