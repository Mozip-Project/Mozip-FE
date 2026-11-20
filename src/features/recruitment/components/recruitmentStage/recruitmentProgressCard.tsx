import { useId } from 'react'
import type { StepperStatus } from '@/components/ui/Stepper/stepper'
import type { RecruitmentProgress } from '@/features/recruitment/types'
import { getRecruitmentSteps } from '@/features/recruitment/utils/recruitmentStepper'
import { cn } from '@/lib/utils'

const STATUS_LABEL = {
  done: '완료',
  current: '진행 중',
  upcoming: '예정',
} satisfies Record<StepperStatus, string>

// 회색 막대 색은 테두리 토큰에만 있어 3px 위아래 테두리로 6px 막대 표현
const STATUS_CLASS = {
  done: { bar: 'border-brand-solid', label: 'font-medium text-neutral' },
  current: { bar: 'border-brand-solid', label: 'font-semibold text-brand' },
  upcoming: { bar: 'border-neutral-muted', label: 'font-medium text-neutral-subtle' },
} satisfies Record<StepperStatus, { bar: string; label: string }>

type RecruitmentProgressCardProps = {
  progress: RecruitmentProgress
}

function RecruitmentProgressCard({ progress }: RecruitmentProgressCardProps) {
  const titleId = useId()

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-gap-l rounded-l border border-neutral-muted bg-layer-default px-padding-xl py-padding-l"
    >
      <h2 id={titleId} className="text-label1 font-semibold text-neutral">
        모집 진행 단계
      </h2>
      <ol aria-labelledby={titleId} className="flex gap-gap-s">
        {getRecruitmentSteps(progress).map(({ stage, label, status }) => (
          <li
            key={stage}
            aria-current={status === 'current' ? 'step' : undefined}
            className="flex min-w-0 flex-1 flex-col gap-gap-s"
          >
            <span
              aria-hidden
              className={cn('h-1.5 rounded-full border-y-3', STATUS_CLASS[status].bar)}
            />
            <span className={cn('truncate text-label2', STATUS_CLASS[status].label)}>
              <span className="sr-only">{STATUS_LABEL[status]} </span>
              {label}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export { RecruitmentProgressCard }
