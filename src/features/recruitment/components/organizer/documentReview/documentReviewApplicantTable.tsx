import Link from 'next/link'
import { Button } from '@/components/ui/Button/button'
import { TableCell, TableHeadCell } from '@/components/ui/Table/table'
import {
  DOCUMENT_REVIEW_PAGE_SIZE,
  type DocumentReviewAction,
  type DocumentReviewApplicant,
} from '@/features/recruitment/types'
import { getApplicantReviewPath } from '@/features/recruitment/utils/recruitmentRoutes'
import { cn } from '@/lib/utils'
import { formatMonthDayWithWeekday } from '@/utils/date'
import type { ReactNode } from 'react'

const TABLE_LABEL = '서류 평가 지원자 목록'
const ROW_CLASS = 'flex items-center gap-gap-xl px-padding-l py-padding-s'
const COLUMN_CLASS = {
  name: 'w-50 shrink-0',
  position: 'w-35 shrink-0',
  submittedAt: 'w-35 shrink-0',
  action: 'flex min-w-0 flex-1 items-center justify-end',
}
const ACTION_LABEL = {
  evaluate: '평가하기',
  edit: '평가 수정',
  view: '평가 보기',
} satisfies Record<DocumentReviewAction, string>
const SKELETON_ROW_KEYS = Array.from({ length: DOCUMENT_REVIEW_PAGE_SIZE }, (_, index) => index)

type DocumentReviewApplicantTableProps = {
  postingId: string
  applicants: readonly DocumentReviewApplicant[]
  hasPositions: boolean
  // 지원자가 0명일 때만 표시
  emptyState: ReactNode
}

function DocumentReviewApplicantTable({
  postingId,
  applicants,
  hasPositions,
  emptyState,
}: DocumentReviewApplicantTableProps) {
  return (
    <div className="relative max-w-page overflow-x-auto bg-layer-default">
      <div className="min-w-[802px]">
        <div role="table" aria-label={TABLE_LABEL} aria-busy={false} data-slot="applicant-table">
          <TableHead hasPositions={hasPositions} />

          {applicants.map(({ id, name, positionName, submittedAt, action }) => {
            const actionLabel = ACTION_LABEL[action]
            const isPrimaryAction = action === 'evaluate'

            return (
              <div
                key={id}
                role="row"
                data-slot="applicant-row"
                className={cn(
                  ROW_CLASS,
                  'relative border-t border-neutral-subtle bg-layer-default',
                  'transition-colors duration-100 ease-out hover:bg-layer-default-pressed motion-reduce:transition-none',
                )}
              >
                <TableCell type="name" className={COLUMN_CLASS.name}>
                  {name}
                </TableCell>

                {hasPositions ? (
                  <TableCell type="text" className={COLUMN_CLASS.position}>
                    {positionName ?? ''}
                  </TableCell>
                ) : (
                  <span aria-hidden className={COLUMN_CLASS.position} />
                )}

                <TableCell type="text" className={COLUMN_CLASS.submittedAt}>
                  {submittedAt ? formatMonthDayWithWeekday(submittedAt) : ''}
                </TableCell>

                <div role="cell" className={COLUMN_CLASS.action}>
                  <Button
                    asChild
                    variant={isPrimaryAction ? 'primary' : 'secondary'}
                    size="s"
                    className={cn(
                      'h-9 w-24',
                      isPrimaryAction
                        ? 'hover:bg-brand-solid'
                        : 'hover:border-neutral-muted hover:bg-layer-default',
                      // 행 전체 클릭 영역
                      'after:absolute after:inset-0',
                    )}
                  >
                    <Link
                      href={getApplicantReviewPath(postingId, id)}
                      aria-label={`${name} ${actionLabel}`}
                    >
                      {actionLabel}
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {applicants.length === 0 && emptyState}
      </div>
    </div>
  )
}

function TableHead({ hasPositions }: { hasPositions: boolean }) {
  return (
    <div role="row" className={cn(ROW_CLASS, 'bg-neutral-weak')}>
      <TableHeadCell className={COLUMN_CLASS.name}>지원자</TableHeadCell>

      {hasPositions ? (
        <TableHeadCell className={COLUMN_CLASS.position}>포지션</TableHeadCell>
      ) : (
        <span aria-hidden className={COLUMN_CLASS.position} />
      )}

      <TableHeadCell className={COLUMN_CLASS.submittedAt}>제출일</TableHeadCell>

      <TableHeadCell align="right" className={COLUMN_CLASS.action}>
        <span className="sr-only">평가</span>
      </TableHeadCell>
    </div>
  )
}

// 첫 진입은 포지션 있는 모집 기준, 실제 표와 같은 열 구성 유지
function DocumentReviewSkeletonTable({ hasPositions = true }: { hasPositions?: boolean }) {
  return (
    <div className="relative max-w-page overflow-x-auto bg-layer-default">
      <div className="min-w-[802px]">
        <div role="table" aria-label={TABLE_LABEL} aria-busy={true} data-slot="applicant-table">
          <TableHead hasPositions={hasPositions} />

          {SKELETON_ROW_KEYS.map((key) => (
            <div
              key={key}
              aria-hidden
              data-slot="applicant-skeleton-row"
              className={cn(
                ROW_CLASS,
                'animate-skeleton-delayed-show border-t border-neutral-subtle',
              )}
            >
              <span className={cn(COLUMN_CLASS.name, 'flex items-center gap-gap-s')}>
                <span className="skeleton-bar size-7 rounded-full" />
                <span className="skeleton-bar h-3.5 w-15 rounded-full" />
              </span>

              <span className={cn(COLUMN_CLASS.position, 'flex items-center')}>
                {hasPositions && <span className="skeleton-bar h-3.5 w-16.5 rounded-full" />}
              </span>

              <span className={cn(COLUMN_CLASS.submittedAt, 'flex items-center')}>
                <span className="skeleton-bar h-3.5 w-12.5 rounded-full" />
              </span>

              <span className={COLUMN_CLASS.action}>
                <span className="skeleton-bar h-9 w-24 rounded-m" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export { DocumentReviewApplicantTable, DocumentReviewSkeletonTable }
