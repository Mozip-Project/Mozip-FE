import { useId } from 'react'
import { Chip } from '@/components/ui/Chip/chip'
import {
  ACTIVITY_CATEGORIES,
  type ActivityCategory,
} from '@/features/organization/schemas/organizationProfileSchema'

type ActivityCategoryFieldProps = {
  value: ActivityCategory[]
  onChange: (categories: ActivityCategory[]) => void
}

function ActivityCategoryField({ value, onChange }: ActivityCategoryFieldProps) {
  const labelId = useId()

  // 선택 순서와 관계없이 목록 순서로 유지해 변경 여부 비교를 안정화
  function handlePressedChange(category: ActivityCategory, isPressed: boolean) {
    onChange(
      ACTIVITY_CATEGORIES.filter((item) => (item === category ? isPressed : value.includes(item))),
    )
  }

  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-col gap-gap-s">
      <p className="flex gap-gap-xs text-label1 font-semibold">
        <span id={labelId} className="text-neutral">
          활동 분야 (복수 선택 가능)
        </span>
        <span aria-hidden className="text-critical">
          *
        </span>
      </p>
      <div className="flex flex-wrap gap-gap-s">
        {ACTIVITY_CATEGORIES.map((category) => (
          <Chip
            key={category}
            pressed={value.includes(category)}
            onPressedChange={(isPressed) => handlePressedChange(category, isPressed)}
          >
            {category}
          </Chip>
        ))}
      </div>
    </div>
  )
}

export { ActivityCategoryField }
