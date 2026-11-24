import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getPostingApplyPath } from '@/features/posting/utils/postingRoutes'
import { getHrefWithSearchParams } from '@/utils/searchParams'

const INFO_STEP_INDEX = 0
const ANSWER_STEP_INDEX = 1
const ANSWER_STEP_PARAM = '2'

function getStepHref(postingId: string, searchParams: URLSearchParams, stepIndex: number) {
  const nextParams = new URLSearchParams(searchParams)

  if (stepIndex === ANSWER_STEP_INDEX) {
    nextParams.set('step', ANSWER_STEP_PARAM)
  } else {
    nextParams.delete('step')
  }
  return getHrefWithSearchParams(getPostingApplyPath(postingId), nextParams)
}

type UseApplicationStepOptions = {
  postingId: string
  isInfoComplete: boolean
}

function useApplicationStep({ postingId, isInfoComplete }: UseApplicationStepOptions) {
  const searchParams = useSearchParams()
  const [visitedStepIndex, setVisitedStepIndex] = useState(INFO_STEP_INDEX)

  const isAnswerStepRequested = searchParams.get('step') === ANSWER_STEP_PARAM
  // 지원 정보를 다 채우지 않은 채 2단계 주소로 들어오면 1단계 표시
  const currentStepIndex =
    isAnswerStepRequested && isInfoComplete ? ANSWER_STEP_INDEX : INFO_STEP_INDEX
  const isStepParamInvalid = isAnswerStepRequested && !isInfoComplete

  // 보이는 단계와 주소를 맞춤
  useEffect(() => {
    if (isStepParamInvalid) {
      window.history.replaceState(null, '', getStepHref(postingId, searchParams, INFO_STEP_INDEX))
    }
  }, [isStepParamInvalid, postingId, searchParams])

  // 단계 이동은 서버 요청, 재마운트 없이 URL만 바꿔 입력값 유지
  function moveToStep(stepIndex: number) {
    window.history.pushState(null, '', getStepHref(postingId, searchParams, stepIndex))
    window.scrollTo({ top: 0 })
    setVisitedStepIndex((visited) => Math.max(visited, stepIndex))
  }

  return {
    currentStepIndex,
    furthestStepIndex: Math.max(visitedStepIndex, currentStepIndex),
    moveToStep,
  }
}

export { ANSWER_STEP_INDEX, INFO_STEP_INDEX, useApplicationStep }
