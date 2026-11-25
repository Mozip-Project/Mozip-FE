import type {
  DocumentEvaluationValues,
  Opinion,
} from '@/features/recruitment/schemas/documentEvaluationSchema'
import type {
  MyDocEvaluationFieldsFragment,
  Opinion as OpinionValue,
  SaveDocEvaluationInput,
} from '@/gql/graphql'

const EMPTY_EVALUATION: DocumentEvaluationValues = { opinion: '', scores: {}, memo: '' }

const OPINION_VALUE = {
  pass: 'PASS',
  hold: 'HOLD',
  fail: 'FAIL',
} satisfies Record<Opinion, OpinionValue>

function toOpinion(opinion: OpinionValue): Opinion {
  switch (opinion) {
    case 'PASS':
      return 'pass'
    case 'HOLD':
      return 'hold'
    case 'FAIL':
      return 'fail'
  }
}

// 평가 전(null)이면 빈 폼, 점수는 ScoreRow 값인 문자열로
function toDocumentEvaluationValues(
  evaluation: MyDocEvaluationFieldsFragment | null,
): DocumentEvaluationValues {
  if (!evaluation) {
    return EMPTY_EVALUATION
  }

  return {
    opinion: evaluation.opinion ? toOpinion(evaluation.opinion) : '',
    scores: Object.fromEntries(
      evaluation.scores.map(({ question, score }) => [question.id, String(score)]),
    ),
    memo: evaluation.memo ?? '',
  }
}

// 폼 값 전체로 덮어써 저장, 점수 안 쓰는 공고(scoreQuestionIds null)는 scores 생략
// 고르지 않은 의견·점수와 빈 메모는 보내지 않음
function toSaveDocEvaluationInput(
  applicationId: string,
  { opinion, scores, memo }: DocumentEvaluationValues,
  scoreQuestionIds: readonly string[] | null,
): SaveDocEvaluationInput {
  return {
    applicationId,
    opinion: opinion === '' ? null : OPINION_VALUE[opinion],
    scores:
      scoreQuestionIds?.flatMap((questionId) => {
        const score = scores[questionId]
        return score ? [{ questionId, score: Number(score) }] : []
      }) ?? null,
    memo: memo === '' ? null : memo,
  }
}

export { toDocumentEvaluationValues, toSaveDocEvaluationInput }
