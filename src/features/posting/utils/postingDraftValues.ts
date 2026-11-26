import {
  EMPTY_POSTING_CREATE,
  type PostingCreateValues,
} from '@/features/posting/schemas/postingCreateValues'
import type {
  PostingQuestion,
  PostingQuestionSet,
} from '@/features/posting/schemas/postingFormSchema'
import type { PublicItem, Qualification } from '@/features/posting/schemas/postingInfoSchema'
import {
  INTERVIEW_APPLICANT_COUNTS,
  INTERVIEW_BREAKS,
  INTERVIEW_DURATIONS,
  INTERVIEW_ROOM_COUNTS,
} from '@/features/posting/schemas/postingInterviewSchema'
import type { PostingDraftFieldsFragment } from '@/gql/graphql'
import { getSeoulIsoDate, getSeoulTime } from '@/utils/date'
import { getSlotEndTime, toSlotKey } from './interviewTimetable'
import { createQuestion } from './postingQuestions'

type ServerQuestion = PostingDraftFieldsFragment['questions'][number]
type ServerTimeRange = PostingDraftFieldsFragment['interviewTimeRanges'][number]

function bySortOrder<TItem extends { sortOrder: number }>(a: TItem, b: TItem) {
  return a.sortOrder - b.sortOrder
}

function toSeoulDate(dateTime: string | null) {
  return dateTime ? getSeoulIsoDate(new Date(dateTime)) : null
}

function toSeoulTime(dateTime: string | null) {
  return dateTime ? getSeoulTime(new Date(dateTime)) : null
}

// 선택지에 있는 값만 복원, 없는 값은 미선택
function toOption<TOption extends string>(options: readonly TOption[], value: number | null) {
  return options.find((option) => option === String(value)) ?? null
}

// 화면에서 만들 수 없는 유형(선택형·표)은 복원하지 않음. 파일 문항 설정은 서버에 없어 기본값
function toQuestion(serverQuestion: ServerQuestion): PostingQuestion | null {
  const base = {
    id: serverQuestion.id,
    title: serverQuestion.title,
    description: serverQuestion.description ?? '',
    isRequired: serverQuestion.required,
  }

  switch (serverQuestion.type) {
    case 'TEXT': {
      const question = createQuestion('text')
      return {
        ...question,
        ...base,
        maxLength:
          serverQuestion.maxLength === null ? question.maxLength : String(serverQuestion.maxLength),
      }
    }
    case 'FILE_LINK':
      return { ...createQuestion('file'), ...base }
    // 활동 경험은 저장 input에 없어 서버에 생길 수 없음 (백엔드 확인 중)
    case 'ACTIVITY':
    case 'SINGLE_CHOICE':
    case 'MULTI_CHOICE':
    case 'TABLE':
      return null
  }
}

function toQuestionSet(serverQuestions: ServerQuestion[]): PostingQuestionSet {
  return {
    questions: serverQuestions
      .toSorted(bySortOrder)
      .flatMap((serverQuestion) => toQuestion(serverQuestion) ?? []),
  }
}

// 포지션별 모집은 포지션 순서대로 묶음, 통합 모집은 묶음 하나
function toQuestionSets(posting: PostingDraftFieldsFragment, positionIds: string[]) {
  if (posting.questions.length === 0) {
    return []
  }
  if (posting.noPosition) {
    return [toQuestionSet(posting.questions)]
  }
  return positionIds.map((positionId) =>
    toQuestionSet(posting.questions.filter((question) => question.position?.id === positionId)),
  )
}

// 서버 시각은 HH:mm 또는 HH:mm:ss라 앞 5자리만 사용
function toSlotKeys({ date, startTime, endTime }: ServerTimeRange) {
  const end = endTime.slice(0, 5)
  const slotKeys: string[] = []

  for (let time = startTime.slice(0, 5); time < end; time = getSlotEndTime(time)) {
    slotKeys.push(toSlotKey(date, time))
  }

  return slotKeys
}

// 모집 유형을 고르기 전에 만든 공고와 통합 모집을 구분할 값이 없어 포지션 유무로 판단 (백엔드 확인 필요)
function toRecruitType(posting: PostingDraftFieldsFragment) {
  if (posting.positions.length > 0) {
    return 'position' as const
  }
  return posting.noPosition ? ('integrated' as const) : null
}

// 서버에 없는 서류·최종 발표일, 프로필 사진 필수는 빈 값. 면접 날짜는 저장된 시간대의 날짜로
function toPostingCreateValues(posting: PostingDraftFieldsFragment): PostingCreateValues {
  const positions = posting.positions.toSorted(bySortOrder)
  const mainImage =
    posting.images.find((image) => image.isRepresentative) ??
    posting.images.toSorted(bySortOrder)[0]
  const publicItems: PublicItem[] = [
    ...(posting.region === null ? [] : (['region'] as const)),
    ...(posting.fee === null ? [] : (['fee'] as const)),
  ]
  const qualifications: Qualification[] = [
    ...(posting.allowEnrolled ? (['student'] as const) : []),
    ...(posting.allowOnLeave ? (['leaveOfAbsence'] as const) : []),
    ...(posting.eligibilityNote === null ? [] : (['custom'] as const)),
  ]

  return {
    ...EMPTY_POSTING_CREATE,
    title: posting.title,
    savedMainImageUrl: mainImage?.url ?? null,
    publicItems,
    region: posting.region ?? '',
    fee: posting.fee ?? '',
    qualifications,
    customQualification: posting.eligibilityNote ?? '',
    content: posting.content ?? '',
    recruitStartDate: toSeoulDate(posting.recruitStartAt),
    recruitStartTime: toSeoulTime(posting.recruitStartAt),
    recruitEndDate: toSeoulDate(posting.recruitEndAt),
    recruitEndTime: toSeoulTime(posting.recruitEndAt),
    activityStartDate: posting.activityStartedOn,
    activityEndDate: posting.activityEndedOn,
    recruitType: toRecruitType(posting),
    positions: positions.map(({ name }) => ({ name })),
    questionSets: toQuestionSets(
      posting,
      positions.map((position) => position.id),
    ),
    interviewDuration: toOption(INTERVIEW_DURATIONS, posting.interviewMinutes),
    interviewBreak: toOption(INTERVIEW_BREAKS, posting.breakMinutes),
    interviewDates: [...new Set(posting.interviewTimeRanges.map(({ date }) => date))].toSorted(),
    interviewSlots: posting.interviewTimeRanges.flatMap(toSlotKeys).toSorted(),
    interviewApplicantCount: toOption(
      INTERVIEW_APPLICANT_COUNTS,
      posting.maxApplicantsPerInterview,
    ),
    interviewRoomCount: toOption(INTERVIEW_ROOM_COUNTS, posting.maxParallelInterviews),
  }
}

type SavedPosition = {
  id: string
  name: string
}

// 문항의 positionId로 쓸 저장된 포지션, 문항 묶음과 같은 순서
function getSavedPositions(posting: PostingDraftFieldsFragment): SavedPosition[] {
  return posting.positions.toSorted(bySortOrder).map(({ id, name }) => ({ id, name }))
}

// 포지션을 다시 만들면 서버가 기존 문항의 포지션 연결을 끊음(ON DELETE SET NULL), 화면은 공통 문항을 만들지 않음
function hasDetachedQuestions(posting: PostingDraftFieldsFragment) {
  return (
    !posting.noPosition &&
    posting.positions.length > 0 &&
    posting.questions.some((question) => question.position === null)
  )
}

export { getSavedPositions, hasDetachedQuestions, toPostingCreateValues }
export type { SavedPosition }
