'use client'

import { flushSync } from 'react-dom'
import { Controller, type Control } from 'react-hook-form'
import { TextField } from '@/components/ui/TextField/textField'
import type { PostingCreateValues } from '@/features/posting/schemas/postingCreateValues'
import type { PublicItem } from '@/features/posting/schemas/postingInfoSchema'
import { formatThousands, getCaretAfterDigits, toDigits } from '@/utils/number'
import { PostingOptionGroup, type PostingOption } from './postingOptionGroup'
import type { ChangeEvent, ComponentProps } from 'react'

const PUBLIC_ITEM_OPTIONS = [
  { value: 'region', label: '활동 지역' },
  { value: 'fee', label: '회비' },
] satisfies PostingOption<PublicItem>[]

type PostingPublicItemFieldsProps = {
  control: Control<PostingCreateValues>
}

function PostingPublicItemFields({ control }: PostingPublicItemFieldsProps) {
  return (
    <Controller
      name="publicItems"
      control={control}
      render={({ field }) => (
        <PostingOptionGroup
          label="공개 항목"
          options={PUBLIC_ITEM_OPTIONS}
          value={field.value}
          onChange={field.onChange}
        >
          {field.value.length > 0 && (
            <div className="flex gap-gap-m">
              {field.value.includes('region') && (
                <Controller
                  name="region"
                  control={control}
                  render={({ field: regionField }) => (
                    <TextField
                      className="min-w-0 flex-1"
                      label="활동 지역"
                      placeholder="활동 지역을 입력해 주세요"
                      {...regionField}
                    />
                  )}
                />
              )}
              {field.value.includes('fee') && (
                <Controller
                  name="fee"
                  control={control}
                  render={({ field: { value, onChange, ...feeField } }) => (
                    <PostingFeeField value={value} onValueChange={onChange} {...feeField} />
                  )}
                />
              )}
            </div>
          )}
        </PostingOptionGroup>
      )}
    />
  )
}

type PostingFeeFieldProps = Omit<ComponentProps<'input'>, 'value' | 'onChange'> & {
  value: string
  onValueChange: (digits: string) => void
}

function PostingFeeField({ value, onValueChange, ...props }: PostingFeeFieldProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target
    const caret = input.selectionStart ?? input.value.length
    const digitCountBeforeCaret = input.value.slice(0, caret).replace(/\D/g, '').length
    const digits = toDigits(input.value)

    flushSync(() => onValueChange(digits))
    const nextCaret = getCaretAfterDigits(formatThousands(digits), digitCountBeforeCaret)
    input.setSelectionRange(nextCaret, nextCaret)
  }

  return (
    <TextField
      className="min-w-0 flex-1"
      label="회비"
      placeholder="회비를 입력해 주세요"
      inputMode="numeric"
      value={formatThousands(value)}
      onChange={handleChange}
      {...props}
    />
  )
}

export { PostingPublicItemFields }
