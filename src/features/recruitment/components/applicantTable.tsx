import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar/avatar'
import { Button } from '@/components/ui/Button/button'
import { cn } from '@/lib/utils'
import type { Route } from 'next'
import type { ReactNode } from 'react'

// 헤더·행·스켈레톤 행이 같은 열 너비를 쓰도록 한곳에서 관리
const COLUMN_CLASS = {
  name: 'w-50 shrink-0',
  position: 'w-35 shrink-0',
  submittedAt: 'w-35 shrink-0',
  action: 'flex min-w-0 flex-1 items-center justify-end',
}

const ROW_CLASS = 'flex items-center gap-gap-xl px-padding-l py-padding-s'

const SKELETON_BAR_CLASS = cn(
  'relative shrink-0 overflow-hidden bg-neutral-weak',
  'after:absolute after:inset-0 after:animate-skeleton-shimmer after:bg-linear-to-r after:from-static-transparent after:via-static-white after:to-static-transparent',
  'motion-reduce:after:hidden',
)

type ApplicantTableProps = {
  label: string
  isLoading?: boolean
  children: ReactNode
}

// 좁은 화면에서는 표 영역만 가로 스크롤, relative로 sr-only 텍스트까지 스크롤 영역 안에 유지
function ApplicantTable({ label, isLoading = false, children }: ApplicantTableProps) {
  return (
    <div className="relative max-w-page overflow-x-auto">
      <div
        role="table"
        aria-label={label}
        aria-busy={isLoading}
        data-slot="applicant-table"
        className="min-w-[802px]"
      >
        {children}
      </div>
    </div>
  )
}

function ApplicantTableHead() {
  return (
    <div
      role="row"
      className={cn(ROW_CLASS, 'bg-neutral-weak text-label2 font-medium text-neutral-subtle')}
    >
      <span role="columnheader" className={cn(COLUMN_CLASS.name, 'flex h-5 items-center')}>
        지원자
      </span>
      <span role="columnheader" className={cn(COLUMN_CLASS.position, 'flex h-5 items-center')}>
        포지션
      </span>
      <span role="columnheader" className={cn(COLUMN_CLASS.submittedAt, 'flex h-5 items-center')}>
        제출일
      </span>
      <span role="columnheader" className={cn(COLUMN_CLASS.action, 'flex h-5 items-center')}>
        <span className="sr-only">평가</span>
      </span>
    </div>
  )
}

type ApplicantRowProps = {
  href: Route
  name: string
  position: string
  submittedAt: string
  isEvaluated?: boolean
}

function ApplicantRow({
  href,
  name,
  position,
  submittedAt,
  isEvaluated = false,
}: ApplicantRowProps) {
  const actionLabel = isEvaluated ? '평가 수정' : '평가하기'

  return (
    <div
      role="row"
      data-slot="applicant-row"
      className={cn(
        ROW_CLASS,
        'relative border-t border-neutral-subtle bg-layer-default',
        'transition-colors duration-100 ease-out hover:bg-layer-default-pressed motion-reduce:transition-none',
      )}
    >
      <span role="cell" className={cn(COLUMN_CLASS.name, 'flex h-5 items-center gap-gap-s')}>
        <Avatar size={28} />
        <span className="min-w-0 flex-1 truncate text-body2 font-semibold text-neutral">
          {name}
        </span>
      </span>
      <span
        role="cell"
        className={cn(COLUMN_CLASS.position, 'truncate text-body2 text-neutral-muted')}
      >
        {position}
      </span>
      <span
        role="cell"
        className={cn(COLUMN_CLASS.submittedAt, 'truncate text-body2 text-neutral-muted')}
      >
        {submittedAt}
      </span>
      <span role="cell" className={cn(COLUMN_CLASS.action, 'gap-gap-xs')}>
        <Button
          asChild
          variant={isEvaluated ? 'secondary' : 'primary'}
          size="s"
          className={cn(
            // Figma 행 hover 상태에서 버튼 색 유지
            'h-9 w-24',
            isEvaluated
              ? 'hover:border-neutral-muted hover:bg-layer-default'
              : 'hover:bg-brand-solid',
            // 행 전체 클릭 영역, ⌘/Ctrl+클릭 새 탭은 기본 링크 동작 사용
            'after:absolute after:inset-0',
          )}
        >
          <Link href={href} aria-label={`${name} ${actionLabel}`}>
            {actionLabel}
          </Link>
        </Button>
      </span>
    </div>
  )
}

// 데이터 요청이 300ms를 넘길 때만 표시
function ApplicantSkeletonRow() {
  return (
    <div
      aria-hidden
      data-slot="applicant-skeleton-row"
      className={cn(
        ROW_CLASS,
        'animate-skeleton-delayed-show border-t border-neutral-subtle bg-layer-default',
      )}
    >
      <span className={cn(COLUMN_CLASS.name, 'flex items-center gap-gap-s')}>
        <span className={cn(SKELETON_BAR_CLASS, 'size-7 rounded-full')} />
        <span className={cn(SKELETON_BAR_CLASS, 'h-3.5 w-15 rounded-full')} />
      </span>
      <span className={cn(COLUMN_CLASS.position, 'flex items-center')}>
        <span className={cn(SKELETON_BAR_CLASS, 'h-3.5 w-16.5 rounded-full')} />
      </span>
      <span className={cn(COLUMN_CLASS.submittedAt, 'flex items-center')}>
        <span className={cn(SKELETON_BAR_CLASS, 'h-3.5 w-12.5 rounded-full')} />
      </span>
      <span className={COLUMN_CLASS.action}>
        <span className={cn(SKELETON_BAR_CLASS, 'h-9 w-24 rounded-m')} />
      </span>
    </div>
  )
}

export { ApplicantRow, ApplicantSkeletonRow, ApplicantTable, ApplicantTableHead }
