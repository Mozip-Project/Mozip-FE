import GripVerticalIcon from '@/assets/icons/gripVertical.svg'
import type { TimetableApplicant } from '@/features/recruitment/types'
import { formatAvailability } from '@/features/recruitment/utils/interviewTimetable'
import { TimetableApplicantName } from './timetableApplicantName'
import type { Ref } from 'react'

type TimetableDragGhostProps = {
  applicant: TimetableApplicant
  ref: Ref<HTMLSpanElement>
}

// 끄는 동안 커서를 따라가는 칩, 화면 밖에 두고 setDragImage로만 사용
function TimetableDragGhost({ applicant, ref }: TimetableDragGhostProps) {
  const availability = formatAvailability(applicant.availableTimes)

  return (
    <span
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed top-0 -left-full flex rotate-2 items-center gap-gap-s rounded-m border-2 border-brand-solid bg-brand-weak px-padding-s py-padding-xs whitespace-nowrap shadow-floating"
    >
      <GripVerticalIcon className="size-4 shrink-0 text-neutral-subtle" />
      <TimetableApplicantName applicant={applicant} />
      {availability && (
        <>
          <span className="h-3 shrink-0 border-l border-neutral-muted" />
          <span className="text-caption1 font-medium text-brand">{availability}</span>
        </>
      )}
    </span>
  )
}

export { TimetableDragGhost }
