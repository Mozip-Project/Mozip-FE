'use client'

import { useId, useState } from 'react'
import ChevronDownIcon from '@/assets/icons/chevronDown.svg'
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/DropdownMenu/dropdownMenu'
import { FieldLabel } from '@/components/ui/FieldLabel/fieldLabel'
import {
  SelectMenuContent,
  type SelectMenuOption,
} from '@/components/ui/SelectMenu/selectMenuContent'
import { usePointerFocus } from '@/hooks/usePointerFocus'
import { cn } from '@/lib/utils'
import { FIELD_TRIGGER_CLASS } from './selectField.variants'

const SELECT_MENU_OFFSET_PX = 8

type SelectFieldProps<TValue extends string> = {
  label: string
  options: readonly SelectMenuOption<TValue>[]
  value: TValue | null
  onValueChange: (value: TValue) => void
  placeholder?: string
  required?: boolean
  isLabelHidden?: boolean
  menuSide?: 'bottom'
  onOpenChange?: (isOpen: boolean) => void
  // 메뉴가 닫힌 상태에서 포커스가 필드를 벗어날 때 호출
  onBlur?: () => void
  errorMessage?: string
  className?: string
}

function SelectField<TValue extends string>({
  label,
  options,
  value,
  onValueChange,
  placeholder = '',
  required = false,
  isLabelHidden = false,
  menuSide,
  onOpenChange,
  onBlur,
  errorMessage,
  className,
}: SelectFieldProps<TValue>) {
  const id = useId()
  const labelId = `${id}-label`
  const valueId = `${id}-value`
  const errorId = `${id}-error`
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isPointerFocus, markPointerFocus } = usePointerFocus()
  const selectedLabel = options.find((option) => option.value === value)?.label

  function handleOpenChange(isOpen: boolean) {
    setIsMenuOpen(isOpen)
    onOpenChange?.(isOpen)
  }

  function handleTriggerBlur() {
    // 메뉴가 열리며 목록으로 포커스가 옮겨 가는 blur 제외
    if (!isMenuOpen) {
      onBlur?.()
    }
  }

  return (
    <div className={cn('flex flex-col gap-gap-s', className)}>
      <FieldLabel id={labelId} label={label} required={required} isHidden={isLabelHidden} />
      <DropdownMenu open={isMenuOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-labelledby={`${labelId} ${valueId}`}
            // button 역할은 aria-invalid 미지원, 오류는 aria-describedby로 전달
            data-invalid={errorMessage ? '' : undefined}
            aria-describedby={errorMessage ? errorId : undefined}
            data-pointer-focus={isPointerFocus ? '' : undefined}
            onPointerDown={markPointerFocus}
            onBlur={handleTriggerBlur}
            className={cn(
              'group',
              FIELD_TRIGGER_CLASS,
              'data-invalid:border-critical-solid data-invalid:not-data-pointer-focus:focus-visible:outline-2 data-invalid:not-data-pointer-focus:focus-visible:outline-offset-2 data-invalid:not-data-pointer-focus:focus-visible:outline-focus-ring data-invalid:not-data-pointer-focus:focus-visible:outline-solid',
            )}
          >
            <span
              id={valueId}
              className={cn(
                'min-w-0 flex-1 truncate text-body2 font-normal',
                selectedLabel ? 'text-neutral' : 'text-placeholder',
              )}
            >
              {selectedLabel ?? placeholder}
            </span>
            <ChevronDownIcon
              aria-hidden
              className="size-4.5 shrink-0 text-neutral group-aria-expanded:rotate-180"
            />
          </button>
        </DropdownMenuTrigger>
        <SelectMenuContent
          options={options}
          value={value}
          onValueChange={onValueChange}
          sideOffset={SELECT_MENU_OFFSET_PX}
          side={menuSide}
          className={cn(
            'min-w-(--radix-dropdown-menu-trigger-width)',
            // 방향을 고정하면 남은 공간과 무관하게 목록 전체 표시
            menuSide
              ? 'max-h-109'
              : 'max-h-[min(--spacing(109),var(--radix-dropdown-menu-content-available-height))]',
          )}
        />
      </DropdownMenu>
      {errorMessage && (
        <p id={errorId} className="text-label2 font-normal text-critical">
          {errorMessage}
        </p>
      )}
    </div>
  )
}

export { SelectField }
export type { SelectFieldProps }
