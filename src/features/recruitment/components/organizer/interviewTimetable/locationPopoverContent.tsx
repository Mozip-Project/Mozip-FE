import { useState, type FormEvent } from 'react'
import { CHIP_SHAPE_CLASS } from '@/components/ui/Chip/chip'
import { TextField } from '@/components/ui/TextField/textField'
import { cn } from '@/lib/utils'
import { FOCUS_RING_CLASS } from './timetableStyles'

type LocationPopoverContentProps = {
  title: string
  initialLocation: string
  recentLocations: string[]
  onApply: (location: string) => void
}

// Enter 또는 최근 쓴 장소를 누르면 바로 적용
function LocationPopoverContent({
  title,
  initialLocation,
  recentLocations,
  onApply,
}: LocationPopoverContentProps) {
  const [location, setLocation] = useState(initialLocation)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedLocation = location.trim()
    if (trimmedLocation) {
      onApply(trimmedLocation)
    }
  }

  return (
    <div className="flex flex-col gap-gap-l">
      <p className="text-label1 font-semibold text-neutral">{title}</p>
      <form onSubmit={handleSubmit}>
        <TextField
          aria-label={title}
          placeholder="장소를 입력해 주세요"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        />
      </form>
      {recentLocations.length > 0 && (
        <div className="flex flex-col gap-gap-s">
          <p className="text-caption1 font-normal text-neutral-subtle">최근 쓴 장소</p>
          <ul aria-label="최근 쓴 장소" className="flex flex-wrap gap-gap-s">
            {recentLocations.map((recentLocation) => (
              <li key={recentLocation}>
                <button
                  type="button"
                  onClick={() => onApply(recentLocation)}
                  data-track-target="timetable_location_apply"
                  className={cn(
                    CHIP_SHAPE_CLASS,
                    'cursor-pointer hover:bg-layer-default-pressed',
                    FOCUS_RING_CLASS,
                  )}
                >
                  {recentLocation}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export { LocationPopoverContent }
