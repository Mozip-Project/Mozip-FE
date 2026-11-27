import { useState } from 'react'
import BuildingIcon from '@/assets/icons/building.svg'
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover/popover'
import { cn } from '@/lib/utils'
import { LocationPopoverContent } from './locationPopoverContent'
import { FOCUS_RING_CLASS, POPOVER_BELOW_OFFSET_PX } from './timetableStyles'

type TimetableTrackHeaderProps = {
  trackLabel: string
  // 확정 후 보기 모드에서만 장소 입력
  isReadOnly: boolean
  // 모두 같으면 장소명, 섞이면 가장 많은 장소 외 n곳, 없으면 null
  locationLabel: string | null
  recentLocations: string[]
  onLocationApply: (location: string) => void
}

function TimetableTrackHeader({
  trackLabel,
  isReadOnly,
  locationLabel,
  recentLocations,
  onLocationApply,
}: TimetableTrackHeaderProps) {
  const [isLocationOpen, setIsLocationOpen] = useState(false)
  const title = <span className="text-label1 font-semibold text-neutral">{trackLabel}</span>

  if (!isReadOnly) {
    return <span className="flex min-w-56 flex-1 items-center gap-gap-s">{title}</span>
  }

  return (
    <Popover open={isLocationOpen} onOpenChange={setIsLocationOpen}>
      <PopoverAnchor asChild>
        <span className="flex min-w-56 flex-1 items-center gap-gap-s">
          {title}
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={`${trackLabel} 장소 한 번에 입력, ${locationLabel ?? '입력 전'}`}
              className={cn(
                'flex cursor-pointer items-center gap-gap-xs rounded-full border bg-layer-default py-padding-xxs pr-padding-s pl-padding-xs text-caption1 font-medium',
                locationLabel
                  ? 'border-neutral-subtle text-neutral-muted'
                  : 'border-dashed border-neutral-muted text-neutral-subtle',
                FOCUS_RING_CLASS,
              )}
            >
              <BuildingIcon aria-hidden className="size-4 shrink-0 text-neutral-subtle" />
              {locationLabel ?? '장소 한 번에 입력'}
            </button>
          </PopoverTrigger>
        </span>
      </PopoverAnchor>
      <PopoverContent
        sideOffset={POPOVER_BELOW_OFFSET_PX}
        className="w-(--radix-popover-trigger-width) border-neutral-muted p-padding-l"
      >
        {/* 처음 열면 입력창은 비어 있고 바로 입력 가능 */}
        <LocationPopoverContent
          title={`${trackLabel} 장소 한 번에 입력`}
          initialLocation=""
          recentLocations={recentLocations}
          onApply={(location) => {
            onLocationApply(location)
            setIsLocationOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export { TimetableTrackHeader }
