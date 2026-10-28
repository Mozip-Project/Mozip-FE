import CheckIcon from '@/assets/icons/check.svg'
import { cn } from '@/lib/utils'

// 표시 전용 박스. aria-checked를 가진 요소(checkbox, menuitemcheckbox) 안에서 그 상태 기준으로 모양 전환
function CheckboxMark() {
  return (
    <span
      aria-hidden
      data-slot="checkbox-mark"
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-xs border-[1.5px] border-neutral-weak bg-layer-default text-on-brand-solid',
        'transition-colors motion-reduce:transition-none',
        'in-aria-checked:border-transparent in-aria-checked:bg-brand-solid',
        'in-disabled:border-neutral-muted in-disabled:bg-disabled',
        'in-disabled:in-aria-checked:border-transparent in-disabled:in-aria-checked:bg-disabled in-disabled:in-aria-checked:text-disabled',
      )}
    >
      <CheckIcon className="invisible size-3.5 in-aria-checked:visible" />
    </span>
  )
}

export { CheckboxMark }
