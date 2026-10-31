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
      {/* Figma 헤더 행 높이 40px(버튼 영역 기준)에 맞춤 */}
      <PageHeader title="서류 평가" className="min-h-10" />
      {/* URL 조건을 읽는 목록만 요청 시점에 렌더링, 제목은 정적 셸 유지 */}
      <Suspense fallback={<DocumentReviewContentFallback />}>
        <DocumentReviewContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
