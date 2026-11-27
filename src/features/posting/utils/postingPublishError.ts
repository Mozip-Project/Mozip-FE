import type { ApiFieldError } from '@/lib/apiError'
import type { PostingCreateStep } from './postingCreateSteps'
import type { DraftStepId } from './postingDraftInput'

// 게시 검사 실패(POSTING_400)의 fieldErrors.field가 가리키는 서버 단계를 화면 단계로
// 서버 기본 정보 단계는 모집 기간도 포함하지만 화면 첫 단계로 안내
const PUBLISH_ERROR_STEP: Partial<Record<string, DraftStepId>> = {
  basicStep: 'info',
  positionsStep: 'method',
  interviewStep: 'interview',
  questionsStep: 'form',
}

// 화면 단계 순서상 가장 앞의 실패 단계, 알 수 없는 값만 있으면 null
function getFirstPublishErrorStepId(
  fieldErrors: readonly ApiFieldError[],
  stepIds: readonly PostingCreateStep['id'][],
) {
  const errorStepIds = fieldErrors.flatMap(({ field }) => {
    const stepId = PUBLISH_ERROR_STEP[field]
    return stepId && stepIds.includes(stepId) ? [stepId] : []
  })
  return errorStepIds.toSorted((a, b) => stepIds.indexOf(a) - stepIds.indexOf(b))[0] ?? null
}

export { getFirstPublishErrorStepId }
