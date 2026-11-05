import CheckIcon from '@/assets/icons/check.svg'
import { Avatar } from '@/components/ui/Avatar/avatar'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

type ChipState = 'default' | 'current' | 'done'

const CHIP_STYLE = {
  default: { box: 'border-neutral-muted bg-layer-default', name: 'font-medium text-neutral' },
  current: { box: 'border-brand-solid bg-brand-weak', name: 'font-semibold text-neutral' },
  done: { box: 'border-neutral-muted bg-layer-default', name: 'font-medium text-neutral-muted' },
} satisfies Record<ChipState, { box: string; name: string }>

// 현재 지원자 표시가 평가 완료보다 우선
function getChipState(isCurrent: boolean, isDone: boolean): ChipState {
  if (isCurrent) {
    return 'current'
  }
  return isDone ? 'done' : 'default'
}

type ApplicantChipProps = Omit<ComponentProps<'button'>, 'children'> & {
  name: string
  isCurrent?: boolean
  isDone?: boolean
}

function ApplicantChip({
  name,
  isCurrent = false,
  isDone = false,
  className,
  ...props
}: ApplicantChipProps) {
  const style = CHIP_STYLE[getChipState(isCurrent, isDone)]

  return (
    <button
      type="button"
      aria-current={isCurrent || undefined}
      data-slot="applicant-chip"
      className={cn(
        'flex h-12 w-50 cursor-pointer items-center gap-gap-s rounded-m border py-padding-xs pr-padding-xs pl-padding-s',
        'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
        style.box,
        className,
      )}
      {...props}
    >
      {isDone ? (
        <span className="relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-weak">
          <span aria-hidden className="absolute inset-0 bg-brand-solid opacity-62" />
          <CheckIcon aria-hidden className="relative size-4 text-on-brand-solid" />
        </span>
      ) : (
        <Avatar size={28} className={cn(isCurrent && 'bg-layer-default')} />
      )}
      <span
        title={name}
        className={cn('min-w-0 flex-1 truncate text-left text-label1', style.name)}
      >
        {name}
      </span>
      {isDone && (
        <>
          {/* 스크린리더 단어 구분 */} <span className="sr-only">평가 완료</span>
        </>
      )}
    </button>
  )
}

export { ApplicantChip }
