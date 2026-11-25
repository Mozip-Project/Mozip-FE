import { DocumentEvaluationFrame } from '@/features/recruitment/components/organizer/documentEvaluation/documentEvaluationFrame'

// 지원자 칩을 눌러 이동해도 칩 줄 스크롤 위치가 유지되도록 서류 평가하기 화면끼리 layout 공유
export default function DocumentEvaluationLayout({
  children,
}: LayoutProps<'/manage/postings/[postingId]/documents'>) {
  return <DocumentEvaluationFrame>{children}</DocumentEvaluationFrame>
}
