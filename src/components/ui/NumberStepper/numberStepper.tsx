'use client'

import MinusIcon from '@/assets/icons/minus.svg'
import PlusIcon from '@/assets/icons/plus.svg'
import { clampNumber, type NumberRange } from '@/utils/number'
import type { KeyboardEvent } from 'react'

const STEP_BUTTON_CLASS =
  'flex size-8.5 shrink-0 cursor-pointer items-center justify-center rounded-m text-neutral-subtle outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid aria-disabled:cursor-default aria-disabled:text-disabled'

type NumberStepperProps = NumberRange & {
  label: string
  value: number
  onValueChange: (value: number) => void
  unit?: string
}

function NumberStepper({ label, value, onValueChange, min, max, unit = '' }: NumberStepperProps) {
  const valueText = `${value}${unit}`

  function changeValue(nextValue: number) {
    const clampedValue = clampNumber(nextValue, { min, max })

    if (clampedValue !== value) {
      onValueChange(clampedValue)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
    const keyValues: Partial<Record<string, number>> = {
      ArrowUp: value + 1,
      ArrowRight: value + 1,
      ArrowDown: value - 1,
      ArrowLeft: value - 1,
      Home: min,
      End: max,
    }
    const keyValue = keyValues[event.key]

    if (keyValue === undefined) {
      return
    }
    event.preventDefault()
    changeValue(keyValue)
  }

  return (
    <div className="inline-flex h-10.5 items-center justify-center rounded-[10px] bg-layer-basement px-0.5 py-0.75">
      <button
        type="button"
        aria-label={`${label} 줄이기`}
        aria-disabled={value <= min}
        onClick={() => changeValue(value - 1)}
        className={STEP_BUTTON_CLASS}
      >
        <MinusIcon aria-hidden className="size-4" />
      </button>
      <span
        role="spinbutton"
        tabIndex={0}
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={valueText}
        onKeyDown={handleKeyDown}
        className="flex h-8.5 w-11.5 shrink-0 items-center justify-center rounded-m bg-layer-default px-0.5 text-center text-body2 font-medium whitespace-nowrap text-neutral outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
      >
        {valueText}
      </span>
      <button
        type="button"
        aria-label={`${label} 늘리기`}
        aria-disabled={value >= max}
        onClick={() => changeValue(value + 1)}
        className={STEP_BUTTON_CLASS}
      >
        <PlusIcon aria-hidden className="size-4" />
      </button>
    </div>
  )
}

export { NumberStepper }
export type { NumberStepperProps }
