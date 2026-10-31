'use client'

import { useId, useRef, useState } from 'react'
import AlertCircleIcon from '@/assets/icons/alertCircle.svg'
import CloseIcon from '@/assets/icons/close.svg'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu/dropdownMenu'
import { usePointerFocus } from '@/hooks/usePointerFocus'
import { cn } from '@/lib/utils'
import { MultiSelectOption } from './multiSelectOption'
import { SelectMenuTrigger } from './selectMenuTrigger'

const MENU_SIDE_OFFSET_PX = 8
const SHAKE_OFFSETS_PX = [0, 6, -6, 4, -4, 2, 0]
const SHAKE_DURATION_MS = 300

type MultiSelectMenuOption<TValue extends string> = {
  value: TValue
  label: string
  count?: number
}

type MultiSelectMenuProps<TValue extends string> = {
  label: string
  options: readonly MultiSelectMenuOption<TValue>[]
  values: readonly TValue[]
  onValuesChange: (values: TValue[]) => void
  minSelectionMessage: string
  totalCount?: number
  groupLabel?: string
}

function getTriggerText(label: string, selectedLabels: readonly string[], isAllSelected: boolean) {
  if (isAllSelected) {
    return `${label} 전체`
  }

  const [firstLabel, ...restLabels] = selectedLabels

  if (firstLabel === undefined) {
    return label
  }

  if (restLabels.length === 0) {
    return firstLabel
  }

  return `${firstLabel} 외 ${restLabels.length}개`
}

// 재시도마다 처음부터 재생
function shakeElement(element: HTMLElement) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  element.animate(
    SHAKE_OFFSETS_PX.map((offset) => ({
      transform: `translateX(${offset}px)`,
      easing: 'ease-in-out',
    })),
    SHAKE_DURATION_MS,
  )
}

function MultiSelectMenu<TValue extends string>({
  label,
  options,
  values,
  onValuesChange,
  minSelectionMessage,
  totalCount,
  groupLabel,
}: MultiSelectMenuProps<TValue>) {
  const groupLabelId = useId()
  const errorMessageId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const { isPointerFocus: isResetByPointer, markPointerFocus: markResetByPointer } =
    usePointerFocus()
  // 막힌 시도 횟수, 0이면 오류 숨김
  const [blockedAttemptCount, setBlockedAttemptCount] = useState(0)
  const isErrorVisible = blockedAttemptCount > 0

  const selectedLabels = options
    .filter((option) => values.includes(option.value))
    .map((option) => option.label)

  const isAllSelected = options.length > 0 && selectedLabels.length === options.length
  const isFiltered = options.length > 0 && !isAllSelected

  function handleFilterReset() {
    onValuesChange(options.map((option) => option.value))

    // 사라지는 버튼 대신 트리거로 focus 이동
    triggerRef.current?.focus()
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      setBlockedAttemptCount(0)
    }
  }

  function blockEmptySelection() {
    setBlockedAttemptCount((count) => count + 1)

    if (contentRef.current) {
      shakeElement(contentRef.current)
    }
  }

  function changeValues(nextValues: TValue[]) {
    if (nextValues.length === 0) {
      blockEmptySelection()
      return
    }

    setBlockedAttemptCount(0)
    onValuesChange(nextValues)
  }

  function handleAllCheckedChange(isChecked: boolean) {
    changeValues(isChecked ? options.map((option) => option.value) : [])
  }

  function handleOptionCheckedChange(optionValue: TValue, isChecked: boolean) {
    changeValues(
      isChecked ? [...values, optionValue] : values.filter((value) => value !== optionValue),
    )
  }

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      {/* 버튼 중첩 없이 화살표 자리에 초기화 버튼 배치, h-fit으로 세로 중앙 유지 */}
      <div
        data-pointer-focus={isResetByPointer ? '' : undefined}
        className="group/filter relative inline-flex h-fit"
      >
        <SelectMenuTrigger
          ref={triggerRef}
          label={label}
          isChevronHidden={isFiltered}
          className={cn(
            // 초기화 버튼 hover 시 트리거 hover 유지
            'group-has-[[data-slot=filter-reset]:hover]/filter:bg-transparent-pressed group-has-[[data-slot=filter-reset]:hover]/filter:text-neutral',
            // 포인터로 초기화 시 focus 링 숨김
            'group-data-pointer-focus/filter:focus-visible:outline-none',
          )}
        >
          {getTriggerText(label, selectedLabels, isAllSelected)}
        </SelectMenuTrigger>
        {isFiltered && (
          <button
            type="button"
            data-slot="filter-reset"
            aria-label={`${label} 필터 초기화`}
            onPointerDown={markResetByPointer}
            onClick={handleFilterReset}
            className={cn(
              // 클릭 영역 24px 확보
              "absolute top-1/2 right-padding-s size-4 -translate-y-1/2 cursor-pointer rounded-xs text-neutral-muted after:absolute after:-inset-1 after:content-['']",
              'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
            )}
          >
            <CloseIcon aria-hidden className="pointer-events-none size-4" />
          </button>
        )}
      </div>

      <DropdownMenuContent
        ref={contentRef}
        align="start"
        sideOffset={MENU_SIDE_OFFSET_PX}
        aria-describedby={isErrorVisible ? errorMessageId : undefined}
        className="flex w-60 flex-col gap-gap-xxs rounded-m border-neutral-muted p-padding-xs"
      >
        {groupLabel && <DropdownMenuLabel id={groupLabelId}>{groupLabel}</DropdownMenuLabel>}

        <DropdownMenuGroup
          aria-labelledby={groupLabel ? groupLabelId : undefined}
          className="flex flex-col gap-gap-xxs"
        >
          <MultiSelectOption
            checked={isAllSelected}
            onCheckedChange={handleAllCheckedChange}
            count={totalCount}
          >
            전체
          </MultiSelectOption>

          <DropdownMenuSeparator className="my-gap-xs" />

          {options.map((option) => (
            <MultiSelectOption
              key={option.value}
              checked={values.includes(option.value)}
              onCheckedChange={(isChecked) => handleOptionCheckedChange(option.value, isChecked)}
              count={option.count}
            >
              {option.label}
            </MultiSelectOption>
          ))}
        </DropdownMenuGroup>

        {/* 모달 메뉴가 열리면 바깥 요소가 보조 기술에서 숨겨져, 메뉴 안 상시 영역에서 오류 알림 */}
        <div role="status">
          {isErrorVisible && (
            // 같은 문구 재알림용 새 요소
            <p
              key={blockedAttemptCount}
              id={errorMessageId}
              className="flex items-center gap-gap-xs px-padding-s py-padding-xs text-caption1 font-medium text-critical"
            >
              <AlertCircleIcon aria-hidden className="size-4 shrink-0" />
              {minSelectionMessage}
            </p>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { MultiSelectMenu }
