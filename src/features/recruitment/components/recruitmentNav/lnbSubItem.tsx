import { cn } from '@/lib/utils'

type LnbSubItemProps = {
  label: string
  isActive?: boolean
}

function LnbSubItem({ label, isActive = false }: LnbSubItemProps) {
  return (
    <div
      className={cn(
        'flex h-11 items-center rounded-m pr-padding-s pl-10 text-label1 font-medium text-neutral-muted',
        isActive && 'bg-neutral-weak font-semibold text-neutral',
      )}
    >
      {label}
    </div>
  )
}

export { LnbSubItem }
