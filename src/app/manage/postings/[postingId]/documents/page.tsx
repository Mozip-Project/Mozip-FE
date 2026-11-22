import { Suspense } from 'react'
import {
  DocumentReviewContent,
  DocumentReviewContentFallback,
} from '@/features/recruitment/components/organizer/documentReview/documentReviewContent'

export default function RecruitmentDocumentsPage({
  params,
  searchParams,
}: PageProps<'/manage/postings/[postingId]/documents'>) {
  return (
    <div className="flex flex-col gap-gap-xl">
      {/* 헤더 검색창이 URL 조건을 읽어 목록과 함께 요청 시 렌더링, 정적 셸은 제목과 스켈레톤 */}
      <Suspense fallback={<DocumentReviewContentFallback />}>
        <DocumentReviewContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
