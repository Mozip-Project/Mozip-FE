import { Badge } from '@/components/ui/Badge/badge'
import { TableCell, TableHeadCell } from '@/components/ui/Table/table'
import {
  APPLICANT_MANAGEMENT_PAGE_SIZE,
  type DocumentResultPhase,
  type ManagedApplicant,
} from '@/features/recruitment/types'
import {
  getDocumentResultChip,
  getInterviewResultChip,
  type ApplicantResultChip,
} from '@/features/recruitment/utils/applicantResult'
import { cn } from '@/lib/utils'
import type { ComponentProps, ReactNode } from 'react'

const TABLE_LABEL = '지원자 목록'

const ROW_CLASS = 'flex items-center gap-gap-xl px-padding-l'
const CELL_CLASS = 'flex h-5 min-w-0 flex-1 items-center'

const RESULT_CHIP = {
  pending: { label: '평가 전', tone: 'neutral' },
  inProgress: { label: '평가 중', tone: 'informative' },
  pass: { label: '합격', tone: 'positive' },
  fail: { label: '불합격', tone: 'critical' },
} satisfies Record<
  ApplicantResultChip,
  { label: string; tone: ComponentProps<typeof Badge>['tone'] }
>

const SKELETON_ROW_KEYS = Array.from(
  { length: APPLICANT_MANAGEMENT_PAGE_SIZE },
  (_, index) => index,
)

type ApplicantTableColumns = {
  hasInterview: boolean
  hasPositions: boolean
}

type ApplicantManagementTableProps = {
  applicants: readonly ManagedApplicant[]
  columns: ApplicantTableColumns
  resultPhase: DocumentResultPhase
  emptyState: ReactNode
}

// 조회 전용
function ApplicantManagementTable({
  applicants,
  columns,
  resultPhase,
  emptyState,
}: ApplicantManagementTableProps) {
  return (
    <div className="relative max-w-page overflow-x-auto bg-layer-default">
      <div className="min-w-[802px]">
        <div role="table" aria-label={TABLE_LABEL} aria-busy={false} data-slot="applicant-table">
          <TableHead columns={columns} />
          {applicants.map((applicant) => {
            const { id, name, positionName, documentResult } = applicant
            const interviewChip = getInterviewResultChip(resultPhase, applicant)

            return (
              <div
                key={id}
                role="row"
                className={cn(ROW_CLASS, 'h-15 border-t border-neutral-subtle')}
              >
                <TableCell type="name" className="flex-1">
                  {name}
                </TableCell>

                {columns.hasPositions ? (
                  <TableCell type="text" className="flex-1">
                    {positionName ?? ''}
                  </TableCell>
                ) : (
                  <span aria-hidden className={CELL_CLASS} />
                )}

                <div role="cell" className={CELL_CLASS}>
                  <ResultChip chip={getDocumentResultChip(resultPhase, documentResult)} />
                </div>

                {columns.hasInterview ? (
                  <div role="cell" className={CELL_CLASS}>
                    {interviewChip && <ResultChip chip={interviewChip} />}
                  </div>
                ) : (
                  <span aria-hidden className={CELL_CLASS} />
                )}
              </div>
            )
          })}
        </div>

        {applicants.length === 0 && emptyState}
      </div>
    </div>
  )
}

// 비면접 모집은 서류 결과가 곧 최종 결과
function TableHead({
  columns: { hasInterview, hasPositions },
}: {
  columns: ApplicantTableColumns
}) {
  return (
    <div role="row" className={cn(ROW_CLASS, 'bg-neutral-weak py-padding-s')}>
      <TableHeadCell className="min-w-0 flex-1">이름</TableHeadCell>

      {hasPositions ? (
        <TableHeadCell className="min-w-0 flex-1">지원 파트</TableHeadCell>
      ) : (
        <span aria-hidden className={CELL_CLASS} />
      )}

      <TableHeadCell className="min-w-0 flex-1">
        {hasInterview ? '서류 결과' : '최종 결과'}
      </TableHeadCell>

      {hasInterview ? (
        <TableHeadCell className="min-w-0 flex-1">면접 결과</TableHeadCell>
      ) : (
        <span aria-hidden className={CELL_CLASS} />
      )}
    </div>
  )
}

function ResultChip({ chip }: { chip: ApplicantResultChip }) {
  const { label, tone } = RESULT_CHIP[chip]

  return (
    <Badge tone={tone} variant="weak">
      {label}
    </Badge>
  )
}

// 데이터 요청이 300ms를 넘길 때만 표시, 첫 진입은 파트, 면접이 모두 있는 모집 기준
function ApplicantManagementSkeletonTable({
  columns = { hasInterview: true, hasPositions: true },
}: {
  columns?: ApplicantTableColumns
}) {
  return (
    <div className="relative max-w-page overflow-x-auto bg-layer-default">
      <div className="min-w-[802px]">
        <div role="table" aria-label={TABLE_LABEL} aria-busy={true} data-slot="applicant-table">
          <TableHead columns={columns} />
          {SKELETON_ROW_KEYS.map((key) => (
            <div
              key={key}
              aria-hidden
              data-slot="applicant-skeleton-row"
              className={cn(
                ROW_CLASS,
                'h-15 animate-skeleton-delayed-show border-t border-neutral-subtle',
              )}
            >
              <span className={cn(CELL_CLASS, 'gap-gap-s')}>
                <span className="skeleton-bar size-7 rounded-full" />
                <span className="skeleton-bar h-3.5 w-15 rounded-full" />
              </span>
              <span className={CELL_CLASS}>
                {columns.hasPositions && (
                  <span className="skeleton-bar h-3.5 w-16.5 rounded-full" />
                )}
              </span>
              <span className={CELL_CLASS}>
                <span className="skeleton-bar h-3.5 w-12.5 rounded-full" />
              </span>
              <span className={CELL_CLASS}>
                {columns.hasInterview && (
                  <span className="skeleton-bar h-3.5 w-12.5 rounded-full" />
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export { ApplicantManagementSkeletonTable, ApplicantManagementTable }
export type { ApplicantTableColumns }
