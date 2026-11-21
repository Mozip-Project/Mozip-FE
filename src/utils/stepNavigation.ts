type StepNavigationState = {
  currentIndex: number
  // 한 번 가 본 가장 먼 단계
  furthestIndex: number
  isStepComplete: (index: number) => boolean
}

// 한 번 가 본 단계까지, 그 앞 단계가 모두 입력 조건을 통과할 때만 이동 가능
function canMoveToStep(
  index: number,
  { currentIndex, furthestIndex, isStepComplete }: StepNavigationState,
) {
  if (index === currentIndex || index > furthestIndex) {
    return false
  }
  return Array.from({ length: index }, (_, stepIndex) => stepIndex).every(isStepComplete)
}

export { canMoveToStep }
export type { StepNavigationState }
