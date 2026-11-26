import type { PostingCreateValues } from '@/features/posting/schemas/postingCreateValues'
import type { PostingQuestion } from '@/features/posting/schemas/postingFormSchema'
import type {
  InterviewTimeRangeInput,
  PostingDraftInput,
  QuestionInput,
  QuestionType,
} from '@/gql/graphql'
import { toSeoulDateTime } from '@/utils/date'
import { getDefaultTime } from '@/utils/time'
import {
  getSlotBlocks,
  getSlotEndTime,
  groupSlotKeysByDate,
  TIMETABLE_SLOT_TIMES,
} from './interviewTimetable'
import type { PostingCreateStep } from './postingCreateSteps'
import type { SavedPosition } from './postingDraftValues'

type DraftStepId = Exclude<PostingCreateStep['id'], 'review'>

// 서버 문항 유형에 활동 경험이 없어 저장하지 않음 (백엔드 확인 중)
const QUESTION_TYPE_INPUT = {
  text: 'TEXT',
  activity: null,
  file: 'FILE_LINK',
} satisfies Record<PostingQuestion['type'], QuestionType | null>

type DraftInputContext = {
  // 새로 업로드한 대표 이미지 주소. 없으면 images를 보내지 않아 서버 값 유지
  mainImageUrl?: string
  // 최근 저장 응답의 포지션, 문항 묶음과 같은 순서
  savedPositions: readonly SavedPosition[]
}

function toNullableText(value: string) {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

function toOptionalNumber(value: string | null) {
  return value === null ? null : Number(value)
}

// 지역·회비·직접 입력 자격은 null이 지움이라 끈 항목도 null로 전송
// 첫 저장이 공고 생성이라 면접 여부도 함께 전송
function toInfoInput(
  values: PostingCreateValues,
  hasInterview: boolean,
  mainImageUrl?: string,
): PostingDraftInput {
  return {
    title: values.title.trim(),
    content: values.content,
    region: values.publicItems.includes('region') ? toNullableText(values.region) : null,
    fee: values.publicItems.includes('fee') ? toNullableText(values.fee) : null,
    allowEnrolled: values.qualifications.includes('student'),
    allowOnLeave: values.qualifications.includes('leaveOfAbsence'),
    eligibilityNote: values.qualifications.includes('custom')
      ? toNullableText(values.customQualification)
      : null,
    hasInterview,
    ...(mainImageUrl
      ? { images: [{ url: mainImageUrl, sortOrder: 0, isRepresentative: true }] }
      : {}),
  }
}

// 서류·최종 발표일은 서버에 저장할 필드가 없어 보내지 않음 (백엔드 확인 중)
function toScheduleInput(values: PostingCreateValues): PostingDraftInput {
  const { recruitStartDate, recruitEndDate } = values

  return {
    recruitStartAt: recruitStartDate
      ? toSeoulDateTime(recruitStartDate, values.recruitStartTime ?? getDefaultTime('start'))
      : null,
    recruitEndAt: recruitEndDate
      ? toSeoulDateTime(recruitEndDate, values.recruitEndTime ?? getDefaultTime('end'))
      : null,
    activityStartedOn: values.activityStartDate,
    activityEndedOn: values.activityEndDate,
  }
}

function isSamePositionNames(names: string[], savedPositions: readonly SavedPosition[]) {
  return (
    names.length === savedPositions.length &&
    names.every((name, index) => name === savedPositions[index]?.name)
  )
}

// 포지션은 보낼 때마다 새 id로 다시 만들어져 문항 연결이 끊기므로 바뀐 경우에만 전송
function toMethodInput(
  values: PostingCreateValues,
  savedPositions: readonly SavedPosition[],
): PostingDraftInput {
  switch (values.recruitType) {
    case null:
      return {}
    case 'integrated':
      return { noPosition: true }
    case 'position': {
      const names = values.positions.map(({ name }) => name)
      if (isSamePositionNames(names, savedPositions)) {
        return { noPosition: false }
      }
      return {
        noPosition: false,
        positions: names.map((name, sortOrder) => ({ name, sortOrder })),
      }
    }
  }
}

function toQuestionInput(
  question: PostingQuestion,
  type: QuestionType,
  sortOrder: number,
  positionId: string | null,
): QuestionInput {
  const maxLength = Number(question.maxLength)

  return {
    positionId,
    type,
    title: question.title.trim(),
    description: toNullableText(question.description),
    required: question.isRequired,
    maxLength: question.type === 'text' && Number.isFinite(maxLength) ? maxLength : null,
    sortOrder,
  }
}

// 포지션별 모집은 문항 묶음 순서가 포지션 순서, 통합 모집은 묶음 하나에 positionId null
function toFormInput(
  values: PostingCreateValues,
  savedPositions: readonly SavedPosition[],
): PostingDraftInput {
  const isPositionRecruit = values.recruitType === 'position'

  return {
    questions: values.questionSets.flatMap(({ questions }, setIndex) => {
      const positionId = isPositionRecruit ? (savedPositions[setIndex]?.id ?? null) : null
      return questions
        .flatMap((question) => {
          const type = QUESTION_TYPE_INPUT[question.type]
          return type ? [{ question, type }] : []
        })
        .map(({ question, type }, sortOrder) =>
          toQuestionInput(question, type, sortOrder, positionId),
        )
    }),
  }
}

// 30분 칸 묶음을 시작·종료 시각 블록으로
function toTimeRanges(slotKeys: string[]): InterviewTimeRangeInput[] {
  return groupSlotKeysByDate(slotKeys).flatMap(({ date, slotKeys: dateSlotKeys }) =>
    getSlotBlocks(date, dateSlotKeys).flatMap(({ startIndex, length }) => {
      const startTime = TIMETABLE_SLOT_TIMES[startIndex]
      const lastSlotTime = TIMETABLE_SLOT_TIMES[startIndex + length - 1]
      return startTime && lastSlotTime
        ? [{ positionId: null, date, startTime, endTime: getSlotEndTime(lastSlotTime) }]
        : []
    }),
  )
}

function toInterviewInput(values: PostingCreateValues): PostingDraftInput {
  return {
    interviewMinutes: toOptionalNumber(values.interviewDuration),
    breakMinutes: toOptionalNumber(values.interviewBreak),
    interviewTimeRanges: toTimeRanges(values.interviewSlots),
    maxApplicantsPerInterview: toOptionalNumber(values.interviewApplicantCount),
    maxParallelInterviews: toOptionalNumber(values.interviewRoomCount),
  }
}

// 한 번에 한 단계의 필드만 담아 나머지는 서버 값 유지
function toDraftStepInput(
  stepId: DraftStepId,
  values: PostingCreateValues,
  hasInterview: boolean,
  context: DraftInputContext,
): PostingDraftInput {
  switch (stepId) {
    case 'info':
      return toInfoInput(values, hasInterview, context.mainImageUrl)
    case 'schedule':
      return toScheduleInput(values)
    case 'method':
      return toMethodInput(values, context.savedPositions)
    case 'form':
      return toFormInput(values, context.savedPositions)
    case 'interview':
      return toInterviewInput(values)
  }
}

export { toDraftStepInput }
export type { DraftInputContext, DraftStepId }
