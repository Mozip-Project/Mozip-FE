'use client'

import { Checkbox } from '@/components/ui/Checkbox/checkbox'

type PostingFilterOption<TValue extends string> = {
  value: TValue
  label: string
}

type PostingFilterSectionProps<TValue extends string> = {
  title: string
  allLabel: string
  options: readonly PostingFilterOption<TValue>[]
  // 빈 배열은 전체(필터 없음)
  values: readonly TValue[]
  onValuesChange: (values: TValue[]) => void
}

function PostingFilterSection<TValue extends string>({
  title,
  allLabel,
  options,
  values,
  onValuesChange,
}: PostingFilterSectionProps<TValue>) {
  const isAllSelected = values.length === 0

  // 이미 전체면 조건이 같아 페이지 이동·기록 추가 없음
  function handleAllChange() {
    if (isAllSelected) {
      return
    }

    onValuesChange([])
  }

  function handleOptionChange(value: TValue, isChecked: boolean) {
    const nextValues = options
      .map((option) => option.value)
      .filter((optionValue) => (optionValue === value ? isChecked : values.includes(optionValue)))

    onValuesChange(nextValues)
  }

  return (
    <fieldset>
      <legend className="mb-gap-m text-label1 font-bold text-neutral">{title}</legend>
      <div className="flex flex-col items-start gap-gap-m">
        <Checkbox checked={isAllSelected} onCheckedChange={handleAllChange}>
          {allLabel}
        </Checkbox>
        {options.map((option) => (
          <Checkbox
            key={option.value}
            checked={values.includes(option.value)}
            onCheckedChange={(checked) => handleOptionChange(option.value, checked === true)}
          >
            {option.label}
          </Checkbox>
        ))}
      </div>
    </fieldset>
  )
}

export { PostingFilterSection }
export type { PostingFilterOption }
