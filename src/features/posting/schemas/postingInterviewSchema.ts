import { z } from 'zod'
import { filterDatesInInterviewPeriod } from '@/features/posting/utils/interviewPeriod'
import { countInterviews } from '@/features/posting/utils/interviewTimetable'

const INTERVIEW_DURATIONS = ['15', '20', '30', '40', '60'] as const
const INTERVIEW_BREAKS = ['0', '5', '10', '15'] as const
const INTERVIEW_APPLICANT_COUNTS = ['1', '2', '3', '4', '5'] as const
const INTERVIEW_ROOM_COUNTS = ['1', '2', '3', '4', '5'] as const
const MAX_INTERVIEW_DAYS = 5

const postingInterviewSchema = z.object({
  interviewDuration: z.enum(INTERVIEW_DURATIONS).nullable(),
  interviewBreak: z.enum(INTERVIEW_BREAKS).nullable(),
  interviewDates: z.array(z.string()),
  // 'YYYY-MM-DDTHH:mm' 30분 칸 시작 시각
  interviewSlots: z.array(z.string()),
  interviewApplicantCount: z.enum(INTERVIEW_APPLICANT_COUNTS).nullable(),
  interviewRoomCount: z.enum(INTERVIEW_ROOM_COUNTS).nullable(),
})

type PostingInterviewValues = z.infer<typeof postingInterviewSchema>

const EMPTY_POSTING_INTERVIEW = {
  interviewDuration: null,
  interviewBreak: null,
  interviewDates: [],
  interviewSlots: [],
  interviewApplicantCount: null,
  interviewRoomCount: null,
} satisfies PostingInterviewValues

const REQUIRED_SELECTS = [
  ['interviewDuration', '면접 1회 시간을 선택해 주세요'],
  ['interviewBreak', '쉬는 시간을 선택해 주세요'],
  ['interviewApplicantCount', '면접당 최대 지원자 수를 선택해 주세요'],
  ['interviewRoomCount', '같은 시간 면접실 수를 선택해 주세요'],
] as const

// 발표일을 바꾼 뒤 면접 단계를 건너뛰어도 기간 밖 날짜로는 통과하지 않도록 발표일까지 검사
const requiredPostingInterviewSchema = postingInterviewSchema
  .extend({
    documentResultDate: z.string().nullable(),
    finalResultDate: z.string().nullable(),
  })
  .superRefine((values, context) => {
    for (const [key, message] of REQUIRED_SELECTS) {
      if (!values[key]) {
        context.addIssue({ code: 'custom', path: [key], message })
      }
    }
    const datesInPeriod = filterDatesInInterviewPeriod(
      values.interviewDates,
      values.documentResultDate,
      values.finalResultDate,
    )
    if (
      values.interviewDates.length === 0 ||
      values.interviewDates.length > MAX_INTERVIEW_DAYS ||
      datesInPeriod.length !== values.interviewDates.length
    ) {
      context.addIssue({
        code: 'custom',
        path: ['interviewDates'],
        message: '면접 날짜를 선택해 주세요',
      })
    }

    const interviewCount = countInterviews(
      values.interviewSlots,
      Number(values.interviewDuration),
      Number(values.interviewBreak),
    )
    if (interviewCount === 0) {
      context.addIssue({
        code: 'custom',
        path: ['interviewSlots'],
        message: '면접을 볼 수 있는 시간을 선택해 주세요',
      })
    }
  })

export {
  EMPTY_POSTING_INTERVIEW,
  INTERVIEW_APPLICANT_COUNTS,
  INTERVIEW_BREAKS,
  INTERVIEW_DURATIONS,
  INTERVIEW_ROOM_COUNTS,
  MAX_INTERVIEW_DAYS,
  requiredPostingInterviewSchema as postingInterviewSchema,
}
export type { PostingInterviewValues }
