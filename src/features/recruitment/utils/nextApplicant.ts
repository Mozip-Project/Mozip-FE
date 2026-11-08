type EvaluationOrderApplicant = {
  id: string
  isDone: boolean
}

type NextApplicantResult = {
  id: string
  isWrapped: boolean
}

// 현재 지원자 뒤의 평가 전 지원자 우선, 없으면 앞쪽에서 찾고 모두 끝났으면 null
function findNextApplicantToEvaluate(
  applicants: readonly EvaluationOrderApplicant[],
  currentId: string,
): NextApplicantResult | null {
  const currentIndex = applicants.findIndex(({ id }) => id === currentId)
  const isPending = ({ id, isDone }: EvaluationOrderApplicant) => !isDone && id !== currentId

  const after = applicants.slice(currentIndex + 1).find(isPending)

  if (after) {
    return { id: after.id, isWrapped: false }
  }

  const before = applicants.slice(0, Math.max(currentIndex, 0)).find(isPending)

  if (before) {
    return { id: before.id, isWrapped: true }
  }

  return null
}

export { findNextApplicantToEvaluate }
export type { NextApplicantResult }
