import {
  DOCUMENT_REVIEW_POSITION_LABEL,
  type DocumentReviewApplicant,
} from '@/features/recruitment/types'
import { getApplicantReviewPath } from '@/features/recruitment/utils/recruitmentRoutes'
import { formatMonthDayWithWeekday } from '@/utils/date'
import { ApplicantRow, ApplicantTable, ApplicantTableHead } from './applicantTable'
import type { ReactNode } from 'react'

type DocumentReviewApplicantTableProps = {
  recruitmentId: string
  applicants: readonly DocumentReviewApplicant[]
  // 지원자가 0명일 때만 표시
  emptyState: ReactNode
}

// TODO: 마감 후 '평가 수정' 버튼 상태는 디자인 확정 후 canEditDocumentReview로 분기
function DocumentReviewApplicantTable({
  recruitmentId,
  applicants,
  emptyState,
}: DocumentReviewApplicantTableProps) {
  return (
    <ApplicantTable
      label="서류 평가 지원자 목록"
      emptyState={applicants.length === 0 && emptyState}
    >
      <ApplicantTableHead />
      {applicants.map((applicant) => (
        <ApplicantRow
          key={applicant.id}
          href={getApplicantReviewPath(recruitmentId, applicant.id)}
          name={applicant.name}
          position={DOCUMENT_REVIEW_POSITION_LABEL[applicant.position]}
          submittedAt={formatMonthDayWithWeekday(applicant.submittedAt)}
          isEvaluated={applicant.isEvaluated}
        />
      ))}
    </ApplicantTable>
  )
}

export { DocumentReviewApplicantTable }
