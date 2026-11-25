import { Suspense } from 'react'
import {
  DocumentReviewContent,
  DocumentReviewContentFallback,
} from '@/features/recruitment/components/organizer/documentReview/documentReviewContent'

export default function RecruitmentDocumentsPage() {
  return (
    <div className="flex flex-col gap-gap-xl">
      {/* URL 조건과 평가 목록은 클라이언트에서 조회, 정적 셸에는 제목과 스켈레톤만 포함 */}
      <Suspense fallback={<DocumentReviewContentFallback />}>
        <DocumentReviewContent />
      </Suspense>
    </div>
  )
}
