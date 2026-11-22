'use client'

import { useState, type FocusEvent } from 'react'
import PlusIcon from '@/assets/icons/plus.svg'
import { ActivityItem } from '@/components/ui/ActivityItem/activityItem'
import { TextField } from '@/components/ui/TextField/textField'
import type { PostingActivityField } from '@/features/posting/schemas/postingFormSchema'
import {
  createEmptyActivityAnswer,
  type ActivityAnswer,
  type ActivityInputName,
} from '@/features/recruitment/schemas/applicationAnswerSchema'
import { formatMonthRange } from '@/utils/monthRange'

const ACTIVITY_INPUT_META = {
  name: { label: '활동명', placeholder: '활동명을 입력해 주세요' },
  period: { label: '활동 기간', placeholder: 'YYYY.MM ~ YYYY.MM' },
  role: { label: '역할', placeholder: '담당 역할' },
  achievement: { label: '주요 성과', placeholder: '성과를 입력해 주세요' },
} satisfies Record<ActivityInputName, { label: string; placeholder: string }>

function getInputKey(id: string, name: ActivityInputName) {
  return `${id}.${name}`
}

type ActivityAnswerFieldProps = {
  value: readonly ActivityAnswer[]
  onChange: (value: ActivityAnswer[]) => void
  fields: readonly PostingActivityField[]
  maxCount: number
  // value 순서 기준 항목별 입력 오류
  getInputError?: (index: number, name: ActivityInputName) => string | undefined
}

function ActivityAnswerField({
  value,
  onChange,
  fields,
  maxCount,
  getInputError,
}: ActivityAnswerFieldProps) {
  // 오류는 벗어난 칸에만 표시
  const [touchedInputKeys, setTouchedInputKeys] = useState<ReadonlySet<string>>(new Set())
  const inputNames: ActivityInputName[] = ['name', ...fields]
  const hasPeriod = fields.includes('period')
  const hasRole = fields.includes('role')
  const canAdd = value.length < maxCount

  function markTouched(keys: string[]) {
    setTouchedInputKeys((touched) => new Set([...touched, ...keys]))
  }

  // 문항 밖으로 나가면 지금 있는 칸을 모두 벗어난 것으로 처리
  function handleGroupBlur(event: FocusEvent<HTMLDivElement>) {
    if (!document.hasFocus() || event.currentTarget.contains(event.relatedTarget)) {
      return
    }
    markTouched(value.flatMap((item) => inputNames.map((name) => getInputKey(item.id, name))))
  }

  function handleInputChange(id: string, name: ActivityInputName, inputValue: string) {
    // 활동 기간은 숫자만 쳐도 'YYYY.MM ~ YYYY.MM'이 되도록 정리
    const nextValue = name === 'period' ? formatMonthRange(inputValue) : inputValue

    onChange(value.map((item) => (item.id === id ? { ...item, [name]: nextValue } : item)))
  }

  function handleRemove(id: string) {
    // 필수 검사가 항목 단위라 마지막 한 건은 지우지 않고 내용만 비움
    if (value.length === 1) {
      setTouchedInputKeys(
        (touched) => new Set([...touched].filter((key) => !key.startsWith(`${id}.`))),
      )
      onChange([{ ...createEmptyActivityAnswer(), id }])
      return
    }
    onChange(value.filter((item) => item.id !== id))
  }

  function handleAdd() {
    onChange([...value, createEmptyActivityAnswer()])
  }

  function renderInput(item: ActivityAnswer, index: number, name: ActivityInputName) {
    const inputKey = getInputKey(item.id, name)
    const error = touchedInputKeys.has(inputKey) ? getInputError?.(index, name) : undefined

    return (
      <TextField
        className="min-w-0 flex-1"
        label={ACTIVITY_INPUT_META[name].label}
        placeholder={ACTIVITY_INPUT_META[name].placeholder}
        value={item[name]}
        inputMode={name === 'period' ? 'numeric' : undefined}
        onChange={(event) => handleInputChange(item.id, name, event.target.value)}
        onBlur={() => markTouched([inputKey])}
        aria-invalid={Boolean(error)}
        helper={error}
      />
    )
  }

  return (
    <div className="flex flex-col gap-gap-m" onBlur={handleGroupBlur}>
      {value.map((item, index) => (
        <ActivityItem
          key={item.id}
          title={`활동 경험 ${index + 1}`}
          collapsedTitle={item.name.trim()}
          onRemove={() => handleRemove(item.id)}
        >
          {renderInput(item, index, 'name')}
          {(hasPeriod || hasRole) && (
            <div className="flex items-start gap-gap-m">
              {hasPeriod && renderInput(item, index, 'period')}
              {hasRole && renderInput(item, index, 'role')}
            </div>
          )}
          {fields.includes('achievement') && renderInput(item, index, 'achievement')}
        </ActivityItem>
      ))}
      {canAdd && (
        <button
          type="button"
          onClick={handleAdd}
          className="flex h-12 cursor-pointer items-center justify-center gap-gap-s rounded-m bg-brand-weak p-padding-m text-body2 font-medium text-brand outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
        >
          <PlusIcon aria-hidden className="size-5 shrink-0" />
          활동 경험 추가
        </button>
      )}
    </div>
  )
}

export { ActivityAnswerField }
