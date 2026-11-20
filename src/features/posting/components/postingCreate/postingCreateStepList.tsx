import { Fragment } from 'react'
import type { PostingCreateStep } from '@/features/posting/utils/postingCreateSteps'
import { StepItem } from './stepItem'

type PostingCreateStepListProps = {
  steps: readonly PostingCreateStep[]
  currentIndex: number
  canSelectStep: (index: number) => boolean
  onStepSelect: (index: number) => void
}

function getStepState(index: number, currentIndex: number) {
  if (index < currentIndex) {
    return 'done'
  }
  return index === currentIndex ? 'current' : 'upcoming'
}

function PostingCreateStepList({
  steps,
  currentIndex,
  canSelectStep,
  onStepSelect,
}: PostingCreateStepListProps) {
  return (
    <ol aria-label="공고 작성 단계" className="flex items-center gap-gap-s">
      {steps.map((step, index) => (
        <Fragment key={step.id}>
          {index > 0 && <li aria-hidden className="w-6 shrink-0 border-t border-neutral-weak" />}
          <StepItem
            number={index + 1}
            label={step.label}
            state={getStepState(index, currentIndex)}
            onSelect={canSelectStep(index) ? () => onStepSelect(index) : undefined}
          />
        </Fragment>
      ))}
    </ol>
  )
}

export { PostingCreateStepList }
