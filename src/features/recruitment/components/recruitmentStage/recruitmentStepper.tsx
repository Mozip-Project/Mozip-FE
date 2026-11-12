import CheckIcon from '@/assets/icons/check.svg'
import { Badge } from '@/components/ui/Badge/badge'
import type { RecruitmentProgress } from '@/features/recruitment/types'
import {
  getRecruitmentSteps,
  type RecruitmentStep,
  type RecruitmentStepStatus,
} from '@/features/recruitment/utils/recruitmentStepper'
import { cn } from '@/lib/utils'

// 색 외에 화면 리더로 단계 상태 전달
const STATUS_LABEL = {
  done: '완료',
  current: '진행 중',
  upcoming: '예정',
} satisfies Record<RecruitmentStepStatus, string>

const STATUS_TEXT_CLASS = {
  done: {
    label: 'text-body1 font-medium text-neutral-muted',
    date: 'text-label2 text-neutral-subtle',
  },
  current: {
    label: 'text-headline2 font-semibold text-neutral',
    date: 'text-body2 font-medium text-neutral',
  },
  upcoming: {
    label: 'text-body1 font-medium text-neutral-subtle',
    date: 'text-label2 text-neutral-subtle',
  },
} satisfies Record<RecruitmentStepStatus, { label: string; date: string }>

type RecruitmentStepperProps = {
  progress: RecruitmentProgress
}

function RecruitmentStepper({ progress }: RecruitmentStepperProps) {
  const steps = getRecruitmentSteps(progress)

  return (
    <ol aria-label="모집 단계" className="flex w-full items-start">
      {steps.map((step, index) => (
        <RecruitmentStepItem
          key={step.stage}
          step={step}
          number={index + 1}
          isFirst={index === 0}
          isLast={index === steps.length - 1}
        />
      ))}
    </ol>
  )
}

type RecruitmentStepItemProps = {
  step: RecruitmentStep
  number: number
  isFirst: boolean
  isLast: boolean
}

function RecruitmentStepItem({
  step: { stage, label, status, dateLabel },
  number,
  isFirst,
  isLast,
}: RecruitmentStepItemProps) {
  const isReached = status !== 'upcoming'
  const isDraft = stage === 'posting' && status === 'current'
  const textClass = STATUS_TEXT_CLASS[status]

  return (
    <li
      aria-current={status === 'current' ? 'step' : undefined}
      className="flex min-w-0 flex-1 flex-col items-center gap-gap-xs"
    >
      <div aria-hidden className="flex h-13 w-full items-center">
        <StepLine isHidden={isFirst} isReached={isReached} />
        <StepNode status={status} number={number} />
        {/* 지난 단계 뒤 선만 진행 색 */}
        <StepLine isHidden={isLast} isReached={status === 'done'} />
      </div>
      <div className="flex max-w-full flex-col items-center text-center break-keep">
        <p className={cn('flex items-center gap-gap-s', textClass.label)}>
          {isDraft && (
            <Badge tone="critical" variant="weak">
              작성 중
            </Badge>
          )}
          <span>
            <span className="sr-only">{STATUS_LABEL[status]} </span>
            {label}
          </span>
        </p>
        {dateLabel && <p className={textClass.date}>{dateLabel}</p>}
      </div>
    </li>
  )
}

// 회색 선 색은 테두리 토큰에만 있어 3px 위 테두리로 표현
function StepLine({ isHidden, isReached }: { isHidden: boolean; isReached: boolean }) {
  return (
    <span
      className={cn(
        'min-w-0 flex-1 border-t-3',
        isReached ? 'border-brand-solid' : 'border-neutral-muted',
        isHidden && 'invisible',
      )}
    />
  )
}

function StepNode({ status, number }: { status: RecruitmentStepStatus; number: number }) {
  if (status === 'done') {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-solid text-on-brand-solid">
        <CheckIcon className="size-4.5" />
      </span>
    )
  }

  if (status === 'current') {
    // 6px 연한 테두리를 배경 토큰 색으로 표현
    return (
      <span className="flex size-9 shrink-0 rounded-full bg-brand-weak p-1.5">
        <span className="flex size-full items-center justify-center rounded-full bg-brand-solid text-headline2 font-bold text-on-brand-solid">
          {number}
        </span>
      </span>
    )
  }

  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-weak-pressed text-body2 font-normal text-neutral-subtle">
      {number}
    </span>
  )
}

export { RecruitmentStepper }
