import type { ManagedApplicant, RecruitmentStage } from '@/features/recruitment/types'

type ApplicantResultChip = 'pending' | 'inProgress' | 'pass' | 'fail'

const DOCUMENT_RESULT_CONFIRMED_STAGES = [
  'documentResult',
  'finalResult',
] as const satisfies readonly RecruitmentStage[]

function isDocumentResultConfirmed(stage: RecruitmentStage) {
  return DOCUMENT_RESULT_CONFIRMED_STAGES.some((confirmedStage) => confirmedStage === stage)
}

// 결과 확정 전에는 서버 값이 있어도 합격·불합격 숨김
function getDocumentResultChip(
  stage: RecruitmentStage,
  documentResult: ManagedApplicant['documentResult'],
): ApplicantResultChip {
  if (isDocumentResultConfirmed(stage) && documentResult) {
    return documentResult
  }

  return stage === 'documentReview' ? 'inProgress' : 'pending'
}

// null은 빈칸, 서류 불합격자는 면접 대상이 아님
// TODO: 면접 평가 결과 기획 확정 후 면접 합격·불합격 반영
function getInterviewResultChip(
  stage: RecruitmentStage,
  documentResult: ManagedApplicant['documentResult'],
): ApplicantResultChip | null {
  if (isDocumentResultConfirmed(stage) && documentResult === 'fail') {
    return null
  }

  return 'pending'
}

export { getDocumentResultChip, getInterviewResultChip }
export type { ApplicantResultChip }
