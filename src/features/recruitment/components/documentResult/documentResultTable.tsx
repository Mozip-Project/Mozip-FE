import {
  ResultTable,
  ResultTableConfirmedBadge,
  ResultTableRow,
  ResultTableSelector,
} from '@/features/recruitment/components/resultTable/resultTable'
import {
  DOCUMENT_RESULT_PAGE_SIZE,
  DOCUMENT_REVIEW_POSITION_LABEL,
  type DocumentResult,
  type DocumentResultApplicant,
} from '@/features/recruitment/types'
import type { ReactNode } from 'react'

const TABLE_LABEL = '서류 평가 취합 결과'

type DocumentResultTableProps = {
  hasScore: boolean
  isConfirmed: boolean
  applicants: readonly DocumentResultApplicant[]
  onResultChange: (applicantId: string, result: DocumentResult) => void
  // 지원자가 0명일 때만 표시
  emptyState: ReactNode
}

// TODO: 운영진 의견 페이지 경로 확정 후 행 클릭 이동 연결
function DocumentResultTable({
  hasScore,
  isConfirmed,
  applicants,
  onResultChange,
  emptyState,
}: DocumentResultTableProps) {
  return (
    <ResultTable
      label={TABLE_LABEL}
      hasScore={hasScore}
      emptyState={applicants.length === 0 && emptyState}
    >
      {applicants.map((applicant) => (
        <ResultTableRow
          key={applicant.id}
          rank={applicant.rank}
          name={applicant.name}
          position={DOCUMENT_REVIEW_POSITION_LABEL[applicant.position]}
          opinionCounts={applicant.opinionCounts}
          averageScore={applicant.averageScore}
          result={
            isConfirmed ? (
              <ResultTableConfirmedBadge result={applicant.result} />
            ) : (
              <ResultTableSelector
                aria-label={`${applicant.name} 최종 결과`}
                value={applicant.result}
                onValueChange={(result) => onResultChange(applicant.id, result)}
              />
            )
          }
        />
      ))}
    </ResultTable>
  )
}

function DocumentResultSkeletonTable({ hasScore }: { hasScore: boolean }) {
  return (
    <ResultTable
      label={TABLE_LABEL}
      hasScore={hasScore}
      isLoading
      loadingRowCount={DOCUMENT_RESULT_PAGE_SIZE}
    />
  )
}

export { DocumentResultSkeletonTable, DocumentResultTable }
