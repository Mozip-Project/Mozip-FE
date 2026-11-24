import type { DocumentResultPhase, ManagedApplicant } from '@/features/recruitment/types'
import type { PostingStatus } from '@/gql/graphql'

type ApplicantResultChip = 'pending' | 'inProgress' | 'pass' | 'fail'

// 명세상 결과 칩은 서버가 주지 않아 공고 상태와 서류 결과 확정 시각으로 계산
function getDocumentResultPhase(
  status: PostingStatus,
  docResultConfirmedAt: string | null,
): DocumentResultPhase {
  if (docResultConfirmedAt !== null) {
    return 'confirmed'
  }

  switch (status) {
    case 'DRAFT':
    case 'RECRUITING':
      return 'beforeReview'
    case 'DOC_REVIEW':
      return 'inReview'
    // 확정 시각 없이 이후 단계가 오는 경우는 명세에 없어 평가 중으로 처리
    case 'DOC_RESULT_NOTICE':
    case 'INTERVIEW':
    case 'FINAL_RESULT':
    case 'ENDED':
      return 'inReview'
  }
}

// 확정 후 보류·평가 전은 남을 수 없지만 서버 enum을 빠짐없이 처리
function getDocumentResultChip(
  phase: DocumentResultPhase,
  documentResult: ManagedApplicant['documentResult'],
): ApplicantResultChip {
  switch (phase) {
    case 'beforeReview':
      return 'pending'
    case 'inReview':
      return 'inProgress'
    case 'confirmed':
      switch (documentResult) {
        case 'PASS':
          return 'pass'
        case 'FAIL':
          return 'fail'
        case 'PENDING':
        case 'HOLD':
          return 'pending'
      }
  }
}

// null은 빈칸, 서류 합격자만 면접 결과 표시
function getInterviewResultChip(
  phase: DocumentResultPhase,
  { documentResult, finalResult }: Pick<ManagedApplicant, 'documentResult' | 'finalResult'>,
): ApplicantResultChip | null {
  if (phase !== 'confirmed') {
    return 'pending'
  }
  if (documentResult !== 'PASS') {
    return null
  }

  switch (finalResult) {
    case 'PENDING':
      return 'pending'
    case 'PASS':
      return 'pass'
    case 'FAIL':
      return 'fail'
  }
}

export { getDocumentResultChip, getDocumentResultPhase, getInterviewResultChip }
export type { ApplicantResultChip }
