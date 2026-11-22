import { Avatar } from '@/components/ui/Avatar/avatar'
import { Badge } from '@/components/ui/Badge/badge'
import {
  ApplicantSkeletonRow,
  ApplicantTable,
} from '@/features/recruitment/components/organizer/recruitmentBoard/applicantTable'
import {
  APPLICANT_MANAGEMENT_PAGE_SIZE,
  DOCUMENT_REVIEW_POSITION_LABEL,
  type ManagedApplicant,
  type RecruitmentProgress,
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

// 비면접 모집은 서류 결과가 곧 최종 결과
function getColumnLabels(hasInterview: boolean) {
  return hasInterview
    ? ['이름', '지원 파트', '서류 결과', '면접 결과']
    : ['이름', '지원 파트', '최종 결과']
}

// 비면접 모집도 면접 모집과 같은 열 너비를 쓰도록 빈 열 자리 유지
function EmptyColumn() {
  return <span aria-hidden className={CELL_CLASS} />
}

type ApplicantManagementTableProps = {
  applicants: readonly ManagedApplicant[]
  progress: RecruitmentProgress
  emptyState: ReactNode
}

// 조회 전용이라 행 클릭·수정 없음
function ApplicantManagementTable({
  applicants,
  progress: { stage, hasInterview },
  emptyState,
}: ApplicantManagementTableProps) {
  return (
    <ApplicantTable label={TABLE_LABEL} emptyState={applicants.length === 0 && emptyState}>
      <TableHead hasInterview={hasInterview} />
      {applicants.map(({ id, name, position, documentResult }) => {
        const interviewChip = getInterviewResultChip(stage, documentResult)

        return (
          <div key={id} role="row" className={cn(ROW_CLASS, 'h-15 border-t border-neutral-subtle')}>
            <span role="cell" className={cn(CELL_CLASS, 'gap-gap-s')}>
              <Avatar size={28} />
              <span className="min-w-0 flex-1 truncate text-body2 font-semibold text-neutral">
                {name}
              </span>
            </span>
            <span role="cell" className={cn(CELL_CLASS, 'text-body2 text-neutral-muted')}>
              <span className="truncate">{DOCUMENT_REVIEW_POSITION_LABEL[position]}</span>
            </span>
            <span role="cell" className={CELL_CLASS}>
              <ResultChip chip={getDocumentResultChip(stage, documentResult)} />
            </span>
            {hasInterview ? (
              <span role="cell" className={CELL_CLASS}>
                {interviewChip && <ResultChip chip={interviewChip} />}
              </span>
            ) : (
              <EmptyColumn />
            )}
          </div>
        )
      })}
    </ApplicantTable>
  )
}

function TableHead({ hasInterview }: { hasInterview: boolean }) {
  return (
    <div
      role="row"
      className={cn(
        ROW_CLASS,
        'bg-neutral-weak py-padding-s text-label2 font-medium text-neutral-subtle',
      )}
    >
      {getColumnLabels(hasInterview).map((label) => (
        <span key={label} role="columnheader" className={CELL_CLASS}>
          {label}
        </span>
      ))}
      {!hasInterview && <EmptyColumn />}
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

// 데이터 요청이 300ms를 넘길 때만 표시
function ApplicantManagementSkeletonTable({ hasInterview = true }: { hasInterview?: boolean }) {
  return (
    <ApplicantTable label={TABLE_LABEL} isLoading>
      <TableHead hasInterview={hasInterview} />
      {SKELETON_ROW_KEYS.map((key) => (
        <ApplicantSkeletonRow key={key} hasAction={false} />
      ))}
    </ApplicantTable>
  )
}

export { ApplicantManagementSkeletonTable, ApplicantManagementTable }
