import FilterIcon from '@/assets/icons/filter.svg'
import InfoIcon from '@/assets/icons/info.svg'
import SortIcon from '@/assets/icons/sort.svg'
import { Avatar } from '@/components/ui/Avatar/avatar'
import { Badge } from '@/components/ui/Badge/badge'
import { cn } from '@/lib/utils'
import type { ComponentProps, ReactNode } from 'react'

// 행·표 구성은 사용처 담당
type TableHeadCellProps = {
  children: ReactNode
  align?: 'left' | 'right'
  actions?: ReactNode
  className?: string
}

function TableHeadCell({ children, align = 'left', actions, className }: TableHeadCellProps) {
  return (
    <div
      role="columnheader"
      data-slot="table-head-cell"
      className={cn(
        'flex h-5 items-center gap-gap-xs text-label2 font-medium whitespace-nowrap text-neutral-subtle',
        align === 'right' && 'justify-end',
        className,
      )}
    >
      {children}
      {actions}
    </div>
  )
}

const HEAD_ACTION_ICON = {
  info: InfoIcon,
  sort: SortIcon,
  filter: FilterIcon,
} satisfies Record<string, unknown>

type TableHeadActionProps = Omit<ComponentProps<'button'>, 'children'> & {
  icon: keyof typeof HEAD_ACTION_ICON
  label: string
}

function TableHeadAction({ icon, label, className, ...props }: TableHeadActionProps) {
  const Icon = HEAD_ACTION_ICON[icon]

  return (
    <button
      type="button"
      aria-label={label}
      data-slot="table-head-action"
      className={cn(
        'relative flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-xs text-neutral-subtle',
        'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
        // 터치 영역 확장
        'after:absolute after:-inset-1',
        className,
      )}
      {...props}
    >
      <Icon aria-hidden className="size-4" />
    </button>
  )
}

type TableCellProps = {
  type: 'text' | 'name' | 'badge'
  children: string
  className?: string
}

function TableCell({ type, children, className }: TableCellProps) {
  return (
    <div
      role="cell"
      data-slot="table-cell"
      className={cn('flex h-5 min-w-0 items-center gap-gap-s', className)}
    >
      <TableCellContent type={type}>{children}</TableCellContent>
    </div>
  )
}

function TableCellContent({ type, children }: Omit<TableCellProps, 'className'>) {
  switch (type) {
    case 'text':
      return (
        <span
          title={children}
          className="min-w-0 flex-1 truncate text-body2 font-normal text-neutral-muted"
        >
          {children}
        </span>
      )
    case 'name':
      return (
        <>
          <Avatar size={28} />
          <span
            title={children}
            className="min-w-0 flex-1 truncate text-body2 font-semibold text-neutral"
          >
            {children}
          </span>
        </>
      )
    case 'badge':
      return (
        <Badge tone="neutral" variant="weak">
          {children}
        </Badge>
      )
  }
}

export { TableCell, TableHeadAction, TableHeadCell }
