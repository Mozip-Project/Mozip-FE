import type { QuestionCard } from '@/features/recruitment/components/applicationAnswerCards/applicationAnswerCards'
import { toQuestionCard } from '@/features/recruitment/utils/applicationAnswerCard'
import type { SubmittedApplicationQuery } from '@/gql/graphql'
import { formatSeoulDateTime } from '@/utils/date'

type ApplicationResponse = SubmittedApplicationQuery['application']
type PostingQuestion = ApplicationResponse['posting']['questions'][number]
type Answer = ApplicationResponse['answers'][number]

// 비운 문항은 answers에 없어 공고 문항 기준으로 카드 구성, 지원서 작성 화면과 같은 번호
function toQuestionCards(
  questions: readonly PostingQuestion[],
  answers: readonly Answer[],
  positionId: string | null,
) {
  const answerByQuestionId = new Map(answers.map((answer) => [answer.question.id, answer]))
  const visibleQuestions = questions
    .filter(({ position }) => position === null || position.id === positionId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
  const questionCards: QuestionCard[] = []

  visibleQuestions.forEach((question) => {
    const card = toQuestionCard({
      id: question.id,
      number: questionCards.length + 1,
      question,
      answer: answerByQuestionId.get(question.id),
    })

    if (card) {
      questionCards.push(card)
    }
  })

  return questionCards
}

function toSubmittedApplication({
  posting,
  position,
  submittedAt,
  answers,
  availableTimes,
}: ApplicationResponse) {
  return {
    title: position ? `${posting.title} · ${position.name}` : posting.title,
    submittedAtLabel: submittedAt ? formatSeoulDateTime(submittedAt) : null,
    questionCards: toQuestionCards(posting.questions, answers, position?.id ?? null),
    availableSlots: availableTimes.map(formatSeoulDateTime),
  }
}

export { toSubmittedApplication }
