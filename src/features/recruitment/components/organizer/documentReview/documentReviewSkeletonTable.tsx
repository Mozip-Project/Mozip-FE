import {
  ApplicantSkeletonRow,
  ApplicantTable,
  ApplicantTableHead,
} from '@/features/recruitment/components/organizer/recruitmentBoard/applicantTable'
import { DOCUMENT_REVIEW_PAGE_SIZE } from '@/features/recruitment/types'

const SKELETON_ROW_KEYS = Array.from({ length: DOCUMENT_REVIEW_PAGE_SIZE }, (_, index) => index)

function DocumentReviewSkeletonTable() {
  return (
    <ApplicantTable label="서류 평가 지원자 목록" isLoading>
      <ApplicantTableHead />
      {SKELETON_ROW_KEYS.map((key) => (
        <ApplicantSkeletonRow key={key} />
      ))}
    </ApplicantTable>
  )
}

export { DocumentReviewSkeletonTable }
