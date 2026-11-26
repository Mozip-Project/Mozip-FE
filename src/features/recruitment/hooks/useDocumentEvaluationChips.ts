'use client'

import { useRouter } from 'next/navigation'
import { scrollToStickyBarTop } from '@/components/ui/StickyTopBar/stickyTopBar'
import { useDocEvaluationApplicationChipsQuery } from '@/features/recruitment/api/organizer/queries'
import { getApplicantReviewPath } from '@/features/recruitment/utils/recruitmentRoutes'

// 칩 줄과 지원서·패널을 묶은 영역, 맨 위가 고정된 칩 줄 위치
const DOCUMENT_EVALUATION_BODY_SLOT = 'document-evaluation-body'

// 칩 줄과 다음 지원자 찾기가 같은 순서·평가 상태를 보도록 한 곳에서 변환
function useDocumentEvaluationChips(postingId: string) {
  const { data, isPending, isError } = useDocEvaluationApplicationChipsQuery(postingId)

  // 임시저장은 평가 전, 저장 완료만 평가 완료
  const applicants = data?.map(({ application, myEvaluationStatus }) => ({
    id: application.id,
    name: application.user.name,
    isDone: myEvaluationStatus === 'SAVED',
  }))

  return { applicants, isPending, isError }
}

// 칩 줄이 고정돼 있으면 새 지원서 맨 위를 칩 줄 바로 아래로 맞추고, 창 맨 위로 올리는 이동 기본 스크롤은 끔
function useApplicantNavigation(postingId: string) {
  const router = useRouter()

  return function goToApplicant(applicantId: string) {
    const body = document.querySelector(`[data-slot="${DOCUMENT_EVALUATION_BODY_SLOT}"]`)
    if (body) {
      scrollToStickyBarTop(body)
    }
    router.push(getApplicantReviewPath(postingId, applicantId), { scroll: false })
  }
}

export { DOCUMENT_EVALUATION_BODY_SLOT, useApplicantNavigation, useDocumentEvaluationChips }
