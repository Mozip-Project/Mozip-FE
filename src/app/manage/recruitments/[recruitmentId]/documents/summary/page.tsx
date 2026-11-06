import { Suspense } from 'react'
import {
  DocumentResultContent,
  DocumentResultContentFallback,
} from '@/features/recruitment/components/documentResult/documentResultContent'
import {
  DocumentResultHeader,
  DocumentResultHeaderFallback,
} from '@/features/recruitment/components/documentResult/documentResultHeader'

export default function DocumentReviewSummaryPage() {
  return (
    <div className="flex flex-col gap-gap-xl">
      {/* 확정 여부와 URL 조건은 클라이언트에서 조회, 정적 셸에는 제목과 스켈레톤만 포함 */}
      <Suspense fallback={<DocumentResultHeaderFallback />}>
        <DocumentResultHeader />
      </Suspense>
      <Suspense fallback={<DocumentResultContentFallback />}>
        <DocumentResultContent />
      </Suspense>
    </div>
  )
}
