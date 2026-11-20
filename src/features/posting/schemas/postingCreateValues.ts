import { EMPTY_POSTING_FORM, type PostingFormValues } from './postingFormSchema'
import { EMPTY_POSTING_INFO, type PostingInfoValues } from './postingInfoSchema'
import { EMPTY_POSTING_METHOD, type PostingMethodValues } from './postingMethodSchema'
import { EMPTY_POSTING_SCHEDULE, type PostingScheduleValues } from './postingScheduleSchema'

type PostingCreateValues = PostingInfoValues &
  PostingScheduleValues &
  PostingMethodValues &
  PostingFormValues

const EMPTY_POSTING_CREATE = {
  ...EMPTY_POSTING_INFO,
  ...EMPTY_POSTING_SCHEDULE,
  ...EMPTY_POSTING_METHOD,
  ...EMPTY_POSTING_FORM,
} satisfies PostingCreateValues

export { EMPTY_POSTING_CREATE }
export type { PostingCreateValues }
