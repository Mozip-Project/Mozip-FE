import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { PostingCreateStep } from '@/features/posting/utils/postingCreateSteps'
import { getHrefWithSearchParams } from '@/utils/searchParams'

const STEP_SEARCH_PARAM = 'step'

// 첫 저장 직후 주소가 편집 주소로 바뀌어 hook 값이 아닌 현재 주소 기준
function getStepHref(stepId: string) {
  const searchParams = new URLSearchParams(window.location.search)
  searchParams.set(STEP_SEARCH_PARAM, stepId)
  return getHrefWithSearchParams(window.location.pathname, searchParams)
}

type UsePostingCreateStepParams = {
  steps: PostingCreateStep[]
  // 처음 한 번만 계산하도록 함수도 받음
  initialFurthestIndex: number | (() => number)
}

function usePostingCreateStep({ steps, initialFurthestIndex }: UsePostingCreateStepParams) {
  const searchParams = useSearchParams()
  const [furthestIndex, setFurthestIndex] = useState(initialFurthestIndex)

  const requestedIndex = steps.findIndex(({ id }) => id === searchParams.get(STEP_SEARCH_PARAM))
  // step이 없거나 없는·아직 갈 수 없는 단계면 이어 쓸 단계(갈 수 있는 가장 먼 단계) 표시
  const isRequestedStepReachable = requestedIndex !== -1 && requestedIndex <= furthestIndex
  const stepIndex = isRequestedStepReachable ? requestedIndex : furthestIndex
  const stepId = steps[stepIndex]?.id

  // 보이는 단계와 주소를 맞춤, 뒤로가기로 돌아와도 같은 단계 표시
  useEffect(() => {
    if (!isRequestedStepReachable && stepId) {
      window.history.replaceState(null, '', getStepHref(stepId))
    }
  }, [isRequestedStepReachable, stepId])

  // 재마운트 없이 주소만 바꿔 입력값 유지
  function moveToStep(index: number) {
    const nextStepId = steps[index]?.id
    if (!nextStepId) {
      return
    }
    window.history.pushState(null, '', getStepHref(nextStepId))
    setFurthestIndex((furthest) => Math.max(furthest, index))
  }

  return { stepIndex, furthestIndex, moveToStep }
}

export { usePostingCreateStep }
