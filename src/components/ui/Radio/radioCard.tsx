import { cn } from '@/lib/utils'
import { Radio } from './radio'

type RadioCardProps = {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

// RadioGroup 안에서 사용, 카드 전체가 클릭 영역
function RadioCard({ value, label, description, disabled = false }: RadioCardProps) {
  return (
    <label
      className={cn(
        'group flex cursor-pointer items-center gap-gap-m rounded-m border border-neutral-muted bg-layer-default p-padding-m',
        'transition-colors hover:not-has-aria-checked:bg-neutral-weak motion-reduce:transition-none',
        'has-aria-checked:border-brand-solid has-aria-checked:bg-brand-weak',
        'has-disabled:pointer-events-none has-disabled:border-neutral-subtle has-disabled:bg-disabled',
        'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus-ring has-focus-visible:outline-solid',
      )}
    >
      <Radio value={value} disabled={disabled} className="focus-visible:outline-none" />
      <span className="flex min-w-0 flex-1 flex-col gap-gap-xxs break-words">
        <span className="text-body2 font-medium text-neutral group-has-disabled:text-disabled group-has-aria-checked:font-semibold">
          {label}
        </span>
        {description && (
          <span className="text-caption1 font-medium text-neutral-subtle group-has-disabled:text-disabled">
            {description}
          </span>
        )}
      </span>
    </label>
  )
}

export { RadioCard }
export type { RadioCardProps }
