import { DocumentEvaluationApplication } from './documentEvaluationApplication'
import { DocumentEvaluationPanel } from './documentEvaluationPanel'

type DocumentEvaluationContentProps = Pick<
  PageProps<'/manage/postings/[postingId]/documents/[applicantId]'>,
  'params'
>

async function DocumentEvaluationContent({ params }: DocumentEvaluationContentProps) {
  const { postingId, applicantId } = await params

  return (
    <div className="flex items-start gap-gap-xl">
      {/* 지원서 로딩·오류 중에도 페이지 제목 유지 */}
      <h1 className="sr-only">서류 평가</h1>
      <div className="flex min-w-0 flex-1 flex-col gap-gap-l">
        <DocumentEvaluationApplication postingId={postingId} applicationId={applicantId} />
      </div>

      <DocumentEvaluationPanel key={applicantId} postingId={postingId} applicantId={applicantId} />
    </div>
  )
}

export { DocumentEvaluationContent }
