import { cn } from '@/lib/utils'

type StepItemState = 'done' | 'current' | 'upcoming'

const STATE_LABEL = {
  done: '완료',
  current: '진행 중',
  upcoming: '예정',
} satisfies Record<StepItemState, string>

const STATE_CLASS = {
  done: {
    number: 'bg-neutral-weak-pressed text-neutral-subtle',
    label: 'font-medium text-neutral-muted',
  },
  current: {
    number: 'bg-brand-solid text-on-brand-solid',
    label: 'font-semibold text-neutral',
  },
  upcoming: {
    number: 'bg-brand-weak text-brand',
    label: 'font-medium text-neutral-subtle',
  },
} satisfies Record<StepItemState, { number: string; label: string }>

type StepItemProps = {
  number: number
  label: string
  state: StepItemState
}

function StepItem({ number, label, state }: StepItemProps) {
  const stateClass = STATE_CLASS[state]

  return (
    <li
      aria-current={state === 'current' ? 'step' : undefined}
      className="flex items-center gap-gap-s"
    >
      <span
        aria-hidden
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-full text-caption1 font-bold',
          stateClass.number,
        )}
      >
        {number}
      </span>
      <span className={cn('text-label1 whitespace-nowrap', stateClass.label)}>
        <span className="sr-only">
          {number}단계 {STATE_LABEL[state]}{' '}
        </span>
        {label}
      </span>
    </li>
  )
}

export { StepItem }
export type { StepItemProps, StepItemState }
