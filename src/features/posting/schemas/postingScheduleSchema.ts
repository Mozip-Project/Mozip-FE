import { z } from 'zod'
import { addDays } from '@/utils/calendar'
import { getDefaultTime } from '@/utils/time'

const postingScheduleSchema = z.object({
  recruitStartDate: z.string().nullable(),
  recruitStartTime: z.string().nullable(),
  recruitEndDate: z.string().nullable(),
  recruitEndTime: z.string().nullable(),
  documentResultDate: z.string().nullable(),
  finalResultDate: z.string().nullable(),
  activityStartDate: z.string().nullable(),
  activityEndDate: z.string().nullable(),
})

type PostingScheduleValues = z.infer<typeof postingScheduleSchema>

const EMPTY_POSTING_SCHEDULE = {
  recruitStartDate: null,
  recruitStartTime: null,
  recruitEndDate: null,
  recruitEndTime: null,
  documentResultDate: null,
  finalResultDate: null,
  activityStartDate: null,
  activityEndDate: null,
} satisfies PostingScheduleValues

// 마감 당일 발표 불가, 면접 공고는 두 발표일 사이에 면접 볼 날이 하루 이상 필요
const RESULT_AFTER_RECRUIT_END_DAYS = 1
const MIN_INTERVIEW_GAP_DAYS = 2

type ResultDateMinimums = {
  documentResultDate: string | null
  finalResultDate: string | null
}

function getResultDateMinimums(
  {
    recruitEndDate,
    documentResultDate,
  }: Pick<PostingScheduleValues, 'recruitEndDate' | 'documentResultDate'>,
  hasInterview: boolean,
): ResultDateMinimums {
  const afterRecruitEnd = recruitEndDate
    ? addDays(recruitEndDate, RESULT_AFTER_RECRUIT_END_DAYS)
    : null
  const afterInterview =
    hasInterview && documentResultDate ? addDays(documentResultDate, MIN_INTERVIEW_GAP_DAYS) : null
  const finalCandidates = [afterRecruitEnd, afterInterview].filter((date) => date !== null)

  return {
    documentResultDate: hasInterview ? afterRecruitEnd : null,
    finalResultDate: finalCandidates.toSorted().at(-1) ?? null,
  }
}

function toDateTime(date: string, time: string | null, timeType: 'start' | 'end') {
  return `${date}T${time ?? getDefaultTime(timeType)}`
}

function createPostingScheduleSchema(hasInterview: boolean) {
  return postingScheduleSchema.superRefine((values, context) => {
    const requiredDates = hasInterview
      ? (['recruitStartDate', 'recruitEndDate', 'documentResultDate', 'finalResultDate'] as const)
      : (['recruitStartDate', 'recruitEndDate', 'finalResultDate'] as const)

    for (const key of requiredDates) {
      if (!values[key]) {
        context.addIssue({ code: 'custom', path: [key], message: '날짜를 선택해 주세요' })
      }
    }

    const { recruitStartDate, recruitStartTime, recruitEndDate, recruitEndTime } = values

    if (
      recruitStartDate &&
      recruitEndDate &&
      toDateTime(recruitEndDate, recruitEndTime, 'end') <
        toDateTime(recruitStartDate, recruitStartTime, 'start')
    ) {
      context.addIssue({
        code: 'custom',
        path: ['recruitEndDate'],
        message: '모집 마감은 모집 시작 이후여야 해요',
      })
    }

    const minimums = getResultDateMinimums(values, hasInterview)

    for (const key of ['documentResultDate', 'finalResultDate'] as const) {
      const date = values[key]
      const minDate = minimums[key]
      if (date && minDate && date < minDate) {
        context.addIssue({
          code: 'custom',
          path: [key],
          message: '발표일은 모집 마감 다음 날부터, 최종 발표는 면접 기간 뒤로 선택해 주세요',
        })
      }
    }

    const { activityStartDate, activityEndDate } = values

    if (activityStartDate && activityEndDate && activityEndDate < activityStartDate) {
      context.addIssue({
        code: 'custom',
        path: ['activityEndDate'],
        message: '활동 종료일은 시작일 이후여야 해요',
      })
    }
  })
}

const POSTING_SCHEDULE_SCHEMAS = {
  interview: createPostingScheduleSchema(true),
  noInterview: createPostingScheduleSchema(false),
}

function getPostingScheduleSchema(hasInterview: boolean) {
  return hasInterview ? POSTING_SCHEDULE_SCHEMAS.interview : POSTING_SCHEDULE_SCHEMAS.noInterview
}

export { EMPTY_POSTING_SCHEDULE, getPostingScheduleSchema, getResultDateMinimums }
export type { PostingScheduleValues }
