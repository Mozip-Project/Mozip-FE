import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { PostingCreateStep } from '@/features/posting/utils/postingCreateSteps'
import { getHrefWithSearchParams } from '@/utils/searchParams'

const STEP_SEARCH_PARAM = 'step'
const FIRST_STEP_INDEX = 0

// 첫 저장 직후 주소가 편집 주소로 바뀌어 hook 값이 아닌 현재 주소 기준
function getStepHref(stepId: string | null) {
  const searchParams = new URLSearchParams(window.location.search)

  if (stepId) {
    searchParams.set(STEP_SEARCH_PARAM, stepId)
  } else {
    searchParams.delete(STEP_SEARCH_PARAM)
  }
  return getHrefWithSearchParams(window.location.pathname, searchParams)
}

type UsePostingCreateStepParams = {
  steps: PostingCreateStep[]
  initialFurthestIndex: number
}

function usePostingCreateStep({ steps, initialFurthestIndex }: UsePostingCreateStepParams) {
  const searchParams = useSearchParams()
  const [furthestIndex, setFurthestIndex] = useState(initialFurthestIndex)

  const requestedStepId = searchParams.get(STEP_SEARCH_PARAM)
  const requestedIndex =
    requestedStepId === null
      ? FIRST_STEP_INDEX
      : steps.findIndex(({ id }) => id === requestedStepId)
  // 없는 단계나 아직 갈 수 없는 단계 주소면 갈 수 있는 가장 먼 단계 표시
  const isRequestedStepReachable = requestedIndex !== -1 && requestedIndex <= furthestIndex
  const stepIndex = isRequestedStepReachable ? requestedIndex : furthestIndex
  // 첫 단계는 step 없는 주소
  const stepParam = stepIndex === FIRST_STEP_INDEX ? null : (steps[stepIndex]?.id ?? null)

  // 보이는 단계와 주소를 맞춤
  useEffect(() => {
    if (!isRequestedStepReachable) {
      window.history.replaceState(null, '', getStepHref(stepParam))
    }
  }, [isRequestedStepReachable, stepParam])

  // 재마운트 없이 주소만 바꿔 입력값 유지
  function moveToStep(index: number) {
    const stepId = index === FIRST_STEP_INDEX ? null : (steps[index]?.id ?? null)
    window.history.pushState(null, '', getStepHref(stepId))
    setFurthestIndex((furthest) => Math.max(furthest, index))
  }

  return { stepIndex, furthestIndex, moveToStep }
}

export { usePostingCreateStep }
