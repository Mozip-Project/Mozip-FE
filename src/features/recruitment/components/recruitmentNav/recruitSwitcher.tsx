import ChevronDownIcon from '@/assets/icons/chevronDown.svg'
import { Badge } from '@/components/ui/Badge/badge'

type RecruitSwitcherProps = {
  name: string
  statusLabel: string
  scheduleLabel: string
}

function RecruitSwitcher({ name, statusLabel, scheduleLabel }: RecruitSwitcherProps) {
  return (
    <div
      data-slot="recruit-switcher"
      className="flex flex-col gap-gap-s rounded-l border border-neutral-weak bg-layer-default p-padding-m"
    >
      <p className="text-caption1 font-medium text-neutral-subtle">모집</p>
      <div className="flex items-center gap-gap-xs text-neutral">
        <p className="min-w-0 flex-1 text-body2 font-bold">{name}</p>
        <ChevronDownIcon aria-hidden className="size-4 shrink-0" />
      </div>
      <div className="flex items-center gap-gap-s">
        <Badge tone="brand" variant="weak">
          {statusLabel}
        </Badge>
        <p className="text-caption1 font-semibold whitespace-nowrap text-neutral-muted">
          {scheduleLabel}
        </p>
      </div>
    </div>
  )
}

export { RecruitSwitcher }
