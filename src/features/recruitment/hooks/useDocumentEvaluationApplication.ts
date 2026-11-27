import { z } from 'zod'
import {
  useDocEvaluationApplicationDetailQuery,
  usePostingQuestionsQuery,
} from '@/features/recruitment/api/organizer/queries'
import type { QuestionCard } from '@/features/recruitment/components/applicationAnswerCards/applicationAnswerCards'
import type { ScoreQuestion } from '@/features/recruitment/components/organizer/documentEvaluationPanel/scoreField'
import { APPLICATION_NOT_FOUND_CODE } from '@/features/recruitment/types'
import { toQuestionCard } from '@/features/recruitment/utils/applicationAnswerCard'
import type { DocEvaluationApplicationDetailQuery, PostingQuestionsQuery } from '@/gql/graphql'
import { ApiError } from '@/lib/apiError'
import { formatSeoulDateTime } from '@/utils/date'
import { formatPhoneNumber } from '@/utils/phone'

type ApplicationDetail = DocEvaluationApplicationDetailQuery['application']
type DetailAnswer = ApplicationDetail['answers'][number]
type PostingQuestion = PostingQuestionsQuery['posting']['questions'][number]

// 제출 시점 프로필(JSON), 학교는 미인증이면 null
const PROFILE_SNAPSHOT_SCHEMA = z.object({
  phone: z.string().nullish(),
  school: z.string().nullish(),
})

// 모양이 다르면 프로필 칸만 비우고 지원서는 그대로 표시
function toApplicantProfile(profileSnapshot: unknown) {
  const result = PROFILE_SNAPSHOT_SCHEMA.safeParse(profileSnapshot)
  const { phone, school } = result.success ? result.data : {}

  return {
    school: school ?? null,
    phone: phone ? formatPhoneNumber(phone) : null,
  }
}

function sortAnswers(answers: readonly DetailAnswer[]) {
  return [...answers].sort((a, b) => a.question.sortOrder - b.question.sortOrder)
}

// 지원서 작성 화면과 같은 번호, 공통·지원 포지션 문항 중 화면에 보이는 유형만 순서대로
function getNumberedQuestions(
  postingQuestions: readonly PostingQuestion[],
  positionId: string | null,
) {
  return postingQuestions
    .filter(({ type }) => type === 'TEXT' || type === 'ACTIVITY' || type === 'FILE_LINK')
    .filter(({ position }) => position === null || position.id === positionId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

// 비운 문항은 answers에 없어 공고 문항 기준으로 카드 구성, 답이 없으면 미응답 카드
function toQuestionCards(
  numberedQuestions: readonly PostingQuestion[],
  answers: readonly DetailAnswer[],
) {
  const answerByQuestionId = new Map(answers.map((answer) => [answer.question.id, answer]))

  return numberedQuestions.flatMap((question, index): QuestionCard[] => {
    const card = toQuestionCard({
      id: question.id,
      number: index + 1,
      question,
      answer: answerByQuestionId.get(question.id),
    })

    return card ? [card] : []
  })
}

function toDocumentEvaluationApplication(
  application: ApplicationDetail,
  postingQuestions: readonly PostingQuestion[],
) {
  const numberedQuestions = getNumberedQuestions(postingQuestions, application.position?.id ?? null)
  const questionNumbers = new Map(numberedQuestions.map(({ id }, index) => [id, index + 1]))

  return {
    name: application.user.name,
    positionName: application.position?.name ?? null,
    ...toApplicantProfile(application.profileSnapshot),
    questionCards: toQuestionCards(numberedQuestions, application.answers),
    // 문항별 점수는 답한 문항만, 번호는 카드와 같음
    scoreQuestions: sortAnswers(application.answers).flatMap(({ question }): ScoreQuestion[] => {
      const number = questionNumbers.get(question.id)
      return number === undefined ? [] : [{ id: question.id, number, label: question.title }]
    }),
    availableSlots: application.availableTimes.map(formatSeoulDateTime),
  }
}

// 지원서 영역과 평가 패널이 같은 조회 결과 사용, 문항 번호까지 매길 수 있을 때 함께 표시
function useDocumentEvaluationApplication(postingId: string, applicationId: string) {
  const detailQuery = useDocEvaluationApplicationDetailQuery(postingId, applicationId)
  const questionsQuery = usePostingQuestionsQuery(postingId)
  const isNotFound =
    detailQuery.error instanceof ApiError && detailQuery.error.code === APPLICATION_NOT_FOUND_CODE

  return {
    application:
      detailQuery.data &&
      questionsQuery.data &&
      toDocumentEvaluationApplication(detailQuery.data, questionsQuery.data),
    isError: detailQuery.isError || questionsQuery.isError,
    isNotFound,
  }
}

export { useDocumentEvaluationApplication }
