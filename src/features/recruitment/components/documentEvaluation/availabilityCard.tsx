import { CHIP_SHAPE_CLASS } from '@/components/ui/Chip/chip'

type AvailabilityCardProps = {
  // 지원자가 고른 면접 가능 시간 표시 문구 (예: 10/21 (수) 13:00)
  slots: readonly string[]
}

function AvailabilityCard({ slots }: AvailabilityCardProps) {
  return (
    <section className="flex min-w-70 flex-col gap-gap-m rounded-l border border-neutral-muted bg-layer-default p-padding-xl">
      <h3 className="text-body1 font-bold break-words text-neutral">
        면접 가능 시간 (지원서에서 수집)
      </h3>
      <div className="flex flex-wrap gap-gap-s">
        {slots.map((slot) => (
          <div key={slot} className={CHIP_SHAPE_CLASS}>
            {slot}
          </div>
        ))}
      </div>
    </section>
  )
}

export { AvailabilityCard }
