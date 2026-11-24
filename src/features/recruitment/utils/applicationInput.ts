import type { PostingActivityField } from '@/features/posting/schemas/postingFormSchema'
import type { PostingQuestion } from '@/features/posting/types'
import type {
  ActivityAnswer,
  ApplicationAnswerValues,
} from '@/features/recruitment/schemas/applicationAnswerSchema'
import type { AnswerInput, ApplicationInput } from '@/gql/graphql'
import { toWebUrl } from '@/utils/url'

type ApplicationInputSource = {
  // 포지션 없는 모집이거나 아직 고르지 않았으면 빈 문자열
  positionId: string
  // 고른 포지션의 문항
  questions: readonly PostingQuestion[]
  answers: ApplicationAnswerValues
}

// 면접 칸 시작 시각은 한국 시간
const SEOUL_UTC_OFFSET = '+09:00'

// TODO: 활동 경험 JSON 모양 백엔드 확인, 지금은 활동명과 문항에서 켠 항목만 담은 배열
function toActivityContent(
  entries: readonly ActivityAnswer[],
  fields: readonly PostingActivityField[],
) {
  const rows = entries
    .map((entry) => ({
      name: entry.name,
      ...Object.fromEntries(fields.map((field) => [field, entry[field]])),
    }))
    .filter((row) => Object.values(row).some((value) => value.trim() !== ''))

  return rows.length > 0 ? JSON.stringify(rows) : null
}

function toAnswerInput(
  question: PostingQuestion,
  answers: ApplicationAnswerValues,
): AnswerInput | null {
  const questionId = question.id

  switch (question.type) {
    case 'text': {
      const text = answers.texts[questionId] ?? ''
      return { questionId, content: text === '' ? null : text }
    }
    case 'activity':
      return {
        questionId,
        content: toActivityContent(answers.activities[questionId] ?? [], question.activityFields),
      }
    case 'file': {
      const links = (answers.files[questionId]?.links ?? []).flatMap(({ url }) => {
        const webUrl = toWebUrl(url)
        return webUrl ? [{ url: webUrl }] : []
      })
      // TODO: 파일 업로드 API(fileKey) 생기면 올린 파일도 포함
      return { questionId, attachments: links }
    }
    // 면접 가능 시간은 답변이 아니라 availableTimes로 보냄
    case 'availability':
      return null
  }
}

function toApplicationInput({
  positionId,
  questions,
  answers,
}: ApplicationInputSource): ApplicationInput {
  const availabilityQuestion = questions.find((question) => question.type === 'availability')

  return {
    positionId: positionId === '' ? null : positionId,
    answers: questions.flatMap((question) => toAnswerInput(question, answers) ?? []),
    availableTimes: availabilityQuestion
      ? (answers.availabilities[availabilityQuestion.id] ?? []).map(
          (slot) => `${slot}:00${SEOUL_UTC_OFFSET}`,
        )
      : null,
  }
}

export { toApplicationInput }
