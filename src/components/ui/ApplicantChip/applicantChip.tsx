import CheckIcon from '@/assets/icons/check.svg'
import { Avatar } from '@/components/ui/Avatar/avatar'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

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
  const nameClassName = cn(
    'min-w-0 flex-1 truncate text-left text-label1',
    isCurrent && 'font-semibold text-neutral',
    !isCurrent && isDone && 'font-medium text-neutral-muted',
    !isCurrent && !isDone && 'font-medium text-neutral',
  )

  return (
    <button
      type="button"
      aria-current={isCurrent || undefined}
      data-slot="applicant-chip"
      className={cn(
        'flex h-12 w-50 cursor-pointer items-center gap-gap-s rounded-m border py-padding-xs pr-padding-xs pl-padding-s',
        'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
        isCurrent ? 'border-brand-solid bg-brand-weak' : 'border-neutral-muted bg-layer-default',
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
      <span title={name} className={nameClassName}>
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
