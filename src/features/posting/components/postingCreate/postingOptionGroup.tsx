'use client'

import { useId, type ReactNode } from 'react'
import { Checkbox } from '@/components/ui/Checkbox/checkbox'
import { FieldLabel } from './fieldLabel'

type PostingOption<TValue extends string> = {
  value: TValue
  label: string
}

type PostingOptionGroupProps<TValue extends string> = {
  label: string
  options: readonly PostingOption<TValue>[]
  value: readonly TValue[]
  onChange: (value: TValue[]) => void
  required?: boolean
  children?: ReactNode
}

function PostingOptionGroup<TValue extends string>({
  label,
  options,
  value,
  onChange,
  required = false,
  children,
}: PostingOptionGroupProps<TValue>) {
  const labelId = useId()

  function handleCheckedChange(optionValue: TValue, isChecked: boolean) {
    onChange(isChecked ? [...value, optionValue] : value.filter((item) => item !== optionValue))
  }

  return (
    <div className="flex flex-col gap-gap-l">
      <div role="group" aria-labelledby={labelId} className="flex items-center gap-gap-xl">
        <div className="w-35 shrink-0">
          <FieldLabel id={labelId} label={label} required={required} />
        </div>
        <div className="flex flex-wrap items-center gap-gap-l">
          {options.map((option) => (
            <Checkbox
              key={option.value}
              checked={value.includes(option.value)}
              onCheckedChange={(checked) => handleCheckedChange(option.value, checked === true)}
            >
              {option.label}
            </Checkbox>
          ))}
        </div>
      </div>
      {children}
    </div>
  )
}

export { PostingOptionGroup }
export type { PostingOption }
