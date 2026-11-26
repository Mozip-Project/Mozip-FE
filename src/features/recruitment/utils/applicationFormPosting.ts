import type {
  PostingActivityField,
  PostingFileType,
} from '@/features/posting/schemas/postingFormSchema'
import type { PostingPosition, PostingQuestion } from '@/features/posting/types'
import type {
  ActivityField,
  FileType,
  PostingApplicationFormQuery,
  PostingMyApplicationsQuery,
} from '@/gql/graphql'

type ApplicationFormPostingResponse = PostingApplicationFormQuery['posting']
type QuestionResponse = ApplicationFormPostingResponse['questions'][number]
type InterviewTimeRangeResponse = ApplicationFormPostingResponse['interviewTimeRanges'][number]
type MyApplicationResponse = PostingMyApplicationsQuery['posting']['myApplications'][number]

type ApplicationFormPosting = {
  title: string
  // null은 포지션 없는 모집
  positions: PostingPosition[] | null
  // 포지션 없는 모집의 문항, 포지션별 모집은 positions 안에 있음
  questions: PostingQuestion[]
  requiresProfilePhoto: boolean
}

// 공고 작성 명세 기본값
const DEFAULT_TEXT_MAX_LENGTH = 500
const DEFAULT_MAX_ACTIVITY_COUNT = 3
// 공고 작성 명세의 면접 블록 단위
const INTERVIEW_SLOT_MINUTES = 30
const MINUTES_PER_HOUR = 60
const INTERVIEW_AVAILABILITY_QUESTION_ID = 'interview-time'

// 운영진 화면에 활동명 끄기가 없어 활동명은 항상 받음, NAME은 켜고 끄는 항목에서 제외
const ACTIVITY_FIELD = {
  PERIOD: 'period',
  ROLE: 'role',
  ACHIEVEMENT: 'achievement',
} satisfies Record<Exclude<ActivityField, 'NAME'>, PostingActivityField>

const FILE_TYPE = {
  PDF: 'pdf',
  IMAGE: 'image',
  PPT: 'ppt',
  MP4: 'mp4',
} satisfies Record<FileType, PostingFileType>

function bySortOrder(a: { sortOrder: number }, b: { sortOrder: number }) {
  return a.sortOrder - b.sortOrder
}

function toPostingQuestion(question: QuestionResponse): PostingQuestion | null {
  const base = {
    id: question.id,
    title: question.title,
    description: question.description,
    isRequired: question.required,
  }
  const options = question.options

  switch (question.type) {
    case 'TEXT':
      return { ...base, type: 'text', maxLength: question.maxLength ?? DEFAULT_TEXT_MAX_LENGTH }
    case 'ACTIVITY':
      return {
        ...base,
        type: 'activity',
        activityFields: (options?.activityFields ?? []).flatMap((field) =>
          field === 'NAME' ? [] : [ACTIVITY_FIELD[field]],
        ),
        maxActivityCount: options?.maxEntries ?? DEFAULT_MAX_ACTIVITY_COUNT,
      }
    case 'FILE_LINK':
      return {
        ...base,
        type: 'file',
        acceptsFile: options?.acceptFile ?? false,
        acceptsLink: options?.acceptLink ?? false,
        fileTypes: (options?.fileTypes ?? []).map((fileType) => FILE_TYPE[fileType]),
      }
    // 공고 작성 명세에서 빠진 유형, 지원서 화면 미지원
    case 'SINGLE_CHOICE':
    case 'MULTI_CHOICE':
    case 'TABLE':
      return null
  }
}

// LocalTime은 'HH:mm' 또는 'HH:mm:ss'
function toMinutesOfDay(time: string) {
  const [hours = 0, minutes = 0] = time.split(':').map(Number)
  return hours * MINUTES_PER_HOUR + minutes
}

function toTimeText(minutesOfDay: number) {
  const hours = String(Math.floor(minutesOfDay / MINUTES_PER_HOUR)).padStart(2, '0')
  const minutes = String(minutesOfDay % MINUTES_PER_HOUR).padStart(2, '0')
  return `${hours}:${minutes}`
}

// 블록을 30분 칸 시작 시각('YYYY-MM-DDTHH:mm')으로 펼침, 운영진이 끈 칸 제외
function getInterviewSlots(ranges: readonly InterviewTimeRangeResponse[]) {
  return ranges
    .flatMap((range) => {
      const closedMinutes = new Set(range.closedSlots.map(toMinutesOfDay))
      const endMinutes = toMinutesOfDay(range.endTime)
      const slots: string[] = []

      for (
        let startMinutes = toMinutesOfDay(range.startTime);
        startMinutes + INTERVIEW_SLOT_MINUTES <= endMinutes;
        startMinutes += INTERVIEW_SLOT_MINUTES
      ) {
        if (!closedMinutes.has(startMinutes)) {
          slots.push(`${range.date}T${toTimeText(startMinutes)}`)
        }
      }
      return slots
    })
    .sort()
}

function getQuestionsFor(
  posting: ApplicationFormPostingResponse,
  positionId: string | null,
): PostingQuestion[] {
  // position null은 공통 문항·전체 공통 면접 시간
  const isForPosition = (target: { position: { id: string } | null }) =>
    target.position === null || target.position.id === positionId
  const answerQuestions = posting.questions
    .filter(isForPosition)
    .sort(bySortOrder)
    .flatMap((question) => toPostingQuestion(question) ?? [])

  if (!posting.hasInterview) {
    return answerQuestions
  }

  // 면접 가능 시간은 문항이 아니라 hasInterview로 붙임(공고 상세 명세)
  const availabilityQuestion: PostingQuestion = {
    id: positionId
      ? `${positionId}-${INTERVIEW_AVAILABILITY_QUESTION_ID}`
      : INTERVIEW_AVAILABILITY_QUESTION_ID,
    type: 'availability',
    title: '면접 가능 시간 선택',
    description: '면접에 참석할 수 있는 시간을 모두 골라 주세요.',
    isRequired: true,
    interviewSlots: getInterviewSlots(posting.interviewTimeRanges.filter(isForPosition)),
  }
  return [...answerQuestions, availabilityQuestion]
}

function toApplicationFormPosting(posting: ApplicationFormPostingResponse): ApplicationFormPosting {
  const common = { title: posting.title, requiresProfilePhoto: posting.profilePhotoRequired }

  if (posting.noPosition) {
    return { ...common, positions: null, questions: getQuestionsFor(posting, null) }
  }

  const positions = [...posting.positions].sort(bySortOrder).map((position) => ({
    id: position.id,
    name: position.name,
    // 서버 조회는 쿠키가 없어 지원 여부를 몰라 화면에서 markAppliedPositions로 채움
    appliedAt: null,
    questions: getQuestionsFor(posting, position.id),
  }))
  return { ...common, positions, questions: [] }
}

// 제출한 지원서의 포지션만 지원 완료, 임시 저장(submittedAt null)은 다시 고를 수 있음
function markAppliedPositions(
  positions: readonly PostingPosition[],
  myApplications: readonly Pick<MyApplicationResponse, 'submittedAt' | 'position'>[],
): PostingPosition[] {
  const submittedAtByPositionId = new Map(
    myApplications.flatMap(({ position, submittedAt }) =>
      position && submittedAt ? [[position.id, submittedAt] as const] : [],
    ),
  )
  return positions.map((position) => ({
    ...position,
    appliedAt: submittedAtByPositionId.get(position.id) ?? null,
  }))
}

export { DEFAULT_TEXT_MAX_LENGTH, markAppliedPositions, toApplicationFormPosting }
export type { ApplicationFormPosting }
