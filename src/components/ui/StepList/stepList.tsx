import { Fragment } from 'react'
import { canMoveToStep, type StepNavigationState } from '@/utils/stepNavigation'
import { StepItem, type StepItemState } from './stepItem'

type StepListStep = {
  id: string
  label: string
}

type StepListSelection = Omit<StepNavigationState, 'currentIndex'> & {
  onSelect: (index: number) => void
}

type StepListProps = {
  label: string
  steps: readonly StepListStep[]
  currentIndex: number
  stepSelection?: StepListSelection
}

function getStepState(index: number, currentIndex: number): StepItemState {
  if (index < currentIndex) {
    return 'done'
  }
  return index === currentIndex ? 'current' : 'upcoming'
}

function StepList({ label, steps, currentIndex, stepSelection }: StepListProps) {
  return (
    <ol aria-label={label} className="flex items-center gap-gap-s">
      {steps.map((step, index) => (
        <Fragment key={step.id}>
          {index > 0 && <li aria-hidden className="w-6 shrink-0 border-t border-neutral-weak" />}
          <StepItem
            number={index + 1}
            label={step.label}
            state={getStepState(index, currentIndex)}
            onSelect={
              stepSelection && canMoveToStep(index, { ...stepSelection, currentIndex })
                ? () => stepSelection.onSelect(index)
                : undefined
            }
          />
        </Fragment>
      ))}
    </ol>
  )
}

export { StepList }
export type { StepListProps, StepListSelection, StepListStep }
