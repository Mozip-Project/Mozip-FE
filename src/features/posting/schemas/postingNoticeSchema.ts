import { z } from 'zod'
import {
  isFilled,
  resultNoticeMessageSchema,
} from '@/features/recruitment/schemas/resultNoticeMessageSchema'

// 공지 발송 명세의 제목 길이 제한, 본문 1,000자는 편집기 입력 제한으로 막음
const POSTING_NOTICE_SUBJECT_MAX_LENGTH = 100

const postingNoticeSchema = resultNoticeMessageSchema.extend({
  subject: z
    .string()
    .refine(isFilled, '메일 제목을 입력해 주세요')
    .refine(
      (value) => value.length <= POSTING_NOTICE_SUBJECT_MAX_LENGTH,
      `메일 제목은 ${POSTING_NOTICE_SUBJECT_MAX_LENGTH}자 이내로 입력해 주세요`,
    ),
})

type PostingNoticeValues = z.infer<typeof postingNoticeSchema>

export { POSTING_NOTICE_SUBJECT_MAX_LENGTH, postingNoticeSchema }
export type { PostingNoticeValues }
