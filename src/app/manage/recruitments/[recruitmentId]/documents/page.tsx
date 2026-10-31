import { Suspense } from 'react'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import {
  DocumentReviewContent,
  DocumentReviewContentFallback,
} from '@/features/recruitment/components/documentReviewContent'

export default function RecruitmentDocumentsPage({
  params,
  searchParams,
}: PageProps<'/manage/recruitments/[recruitmentId]/documents'>) {
  return (
    <div className="flex flex-col gap-gap-xxl">
      {/* Figma 헤더 높이 40px 기준 */}
      <PageHeader title="서류 평가" className="min-h-10" />
      {/* 제목만 정적 셸, URL 조건을 읽는 목록은 요청 시 렌더링 */}
      <Suspense fallback={<DocumentReviewContentFallback />}>
        <DocumentReviewContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
