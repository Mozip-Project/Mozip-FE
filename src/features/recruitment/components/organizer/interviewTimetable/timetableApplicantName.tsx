import type { TimetableApplicant } from '@/features/recruitment/types'
import { cn } from '@/lib/utils'

type TimetableApplicantNameProps = {
  applicant: TimetableApplicant
  // 그룹에서 끌어 가는 중인 지원자
  isDimmed?: boolean
}

function TimetableApplicantName({ applicant, isDimmed = false }: TimetableApplicantNameProps) {
  return (
    <span className="flex shrink-0 items-center gap-gap-s">
      <span
        className={cn('text-label1 font-semibold', isDimmed ? 'text-disabled' : 'text-neutral')}
      >
        {applicant.name}
      </span>
      {applicant.positionName && (
        <span
          className={cn(
            'shrink-0 text-caption1 font-medium',
            isDimmed ? 'text-disabled' : 'text-neutral-subtle',
          )}
        >
          {applicant.positionName}
        </span>
      )}
    </span>
  )
}

export { TimetableApplicantName }
