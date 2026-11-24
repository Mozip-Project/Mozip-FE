import { z } from 'zod'
import type { PostingPosition, PostingQuestion } from '@/features/posting/types'
import {
  createEmptyActivityAnswer,
  createEmptyApplicationAnswers,
  type ActivityAnswer,
  type ApplicationAnswerValues,
  type FileAnswerLink,
} from '@/features/recruitment/schemas/applicationAnswerSchema'
import type { PostingMyApplicationsQuery } from '@/gql/graphql'

type MyApplicationResponse = PostingMyApplicationsQuery['posting']['myApplications'][number]
type AnswerResponse = MyApplicationResponse['answers'][number]
type AvailabilityQuestion = Extract<PostingQuestion, { type: 'availability' }>

type ApplicationFormInitialValues = {
  // 포지션 없는 모집이거나 아직 고르지 않았으면 빈 문자열
  positionId: string
  answers: ApplicationAnswerValues
}

type ApplicationFormInitialValuesSource = {
  // null은 포지션 없는 모집
  positions: readonly PostingPosition[] | null
  // 포지션 없는 모집의 문항
  questions: readonly PostingQuestion[]
  savedDraft: MyApplicationResponse | null
}

// 한국 시간은 서머타임이 없어 고정 오프셋 사용
const SEOUL_UTC_OFFSET_MS = 9 * 60 * 60 * 1000

// toApplicationInput이 보내는 활동 경험 JSON 모양, 문항에서 끈 항목은 빠져 있음
const ACTIVITY_CONTENT_SCHEMA = z.array(
  z
    .object({ name: z.string(), period: z.string(), role: z.string(), achievement: z.string() })
    .partial(),
)

// 제출 전 지원서 중 가장 최근에 저장한 것
function getLatestDraft(myApplications: readonly MyApplicationResponse[]) {
  const drafts = myApplications.filter((application) => application.submittedAt === null)
  drafts.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
  return drafts[0] ?? null
}

function toActivityAnswers(content: string | null): ActivityAnswer[] | null {
  if (!content) {
    return null
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    return null
  }

  const result = ACTIVITY_CONTENT_SCHEMA.safeParse(parsed)
  if (!result.success || result.data.length === 0) {
    return null
  }
  return result.data.map((row) => ({ ...createEmptyActivityAnswer(), ...row }))
}

function toFileLinks(attachments: AnswerResponse['attachments']): FileAnswerLink[] {
  return attachments.flatMap((attachment) => {
    switch (attachment.type) {
      case 'LINK':
        return [{ id: crypto.randomUUID(), url: attachment.url }]
      // TODO: 파일 업로드 API 생기면 올린 파일도 복원
      case 'FILE':
        return []
    }
  })
}

function fillAnswer(
  answers: ApplicationAnswerValues,
  question: PostingQuestion,
  answer: AnswerResponse,
) {
  switch (question.type) {
    case 'text':
      answers.texts[question.id] = answer.content ?? ''
      break
    case 'activity': {
      const activities = toActivityAnswers(answer.content)
      if (activities) {
        answers.activities[question.id] = activities
      }
      break
    }
    case 'file':
      answers.files[question.id] = { files: [], links: toFileLinks(answer.attachments) }
      break
    // 면접 가능 시간은 답변이 아니라 availableTimes로 옴
    case 'availability':
      break
  }
}

// 'YYYY-MM-DDTHH:mm' 한국 시각
function toSeoulSlot(dateTime: string) {
  return new Date(Date.parse(dateTime) + SEOUL_UTC_OFFSET_MS).toISOString().slice(0, 16)
}

// 임시 저장한 지원서가 있으면 그 답변으로, 없으면 빈 답변으로 폼 시작값 생성
function toApplicationFormInitialValues({
  positions,
  questions,
  savedDraft,
}: ApplicationFormInitialValuesSource): ApplicationFormInitialValues {
  const allQuestions = positions ? positions.flatMap((position) => position.questions) : questions
  const answers = createEmptyApplicationAnswers(allQuestions)

  if (!savedDraft) {
    return { positionId: '', answers }
  }

  // 공통 문항은 포지션마다 같은 id라 어느 포지션 문항이든 같은 답변 칸
  const questionById = new Map(allQuestions.map((question) => [question.id, question]))
  for (const answer of savedDraft.answers) {
    const question = questionById.get(answer.question.id)
    if (question) {
      fillAnswer(answers, question, answer)
    }
  }

  const draftPosition = positions?.find(
    (position) => position.id === savedDraft.position?.id && position.appliedAt === null,
  )
  const draftQuestions = positions ? (draftPosition?.questions ?? []) : questions
  const availabilityQuestion = draftQuestions.find(
    (question): question is AvailabilityQuestion => question.type === 'availability',
  )

  if (availabilityQuestion) {
    // 저장 뒤 운영진이 닫은 칸은 제외
    const openSlots = new Set(availabilityQuestion.interviewSlots)
    answers.availabilities[availabilityQuestion.id] = savedDraft.availableTimes
      .map(toSeoulSlot)
      .filter((slot) => openSlots.has(slot))
  }

  return { positionId: draftPosition?.id ?? '', answers }
}

export { getLatestDraft, toApplicationFormInitialValues }
export type { MyApplicationResponse }
