import { EMPTY_POSTING_FORM, type PostingFormValues } from './postingFormSchema'
import { EMPTY_POSTING_INFO, type PostingInfoValues } from './postingInfoSchema'
import { EMPTY_POSTING_INTERVIEW, type PostingInterviewValues } from './postingInterviewSchema'
import { EMPTY_POSTING_METHOD, type PostingMethodValues } from './postingMethodSchema'
import { EMPTY_POSTING_SCHEDULE, type PostingScheduleValues } from './postingScheduleSchema'

type PostingCreateValues = PostingInfoValues &
  PostingScheduleValues &
  PostingMethodValues &
  PostingFormValues &
  PostingInterviewValues

const EMPTY_POSTING_CREATE = {
  ...EMPTY_POSTING_INFO,
  ...EMPTY_POSTING_SCHEDULE,
  ...EMPTY_POSTING_METHOD,
  ...EMPTY_POSTING_FORM,
  ...EMPTY_POSTING_INTERVIEW,
} satisfies PostingCreateValues

export { EMPTY_POSTING_CREATE }
export type { PostingCreateValues }
