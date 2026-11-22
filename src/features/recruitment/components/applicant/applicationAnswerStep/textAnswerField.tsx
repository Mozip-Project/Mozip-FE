'use client'

import { useId, type ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { getTextLength } from '@/utils/text'

type TextAnswerFieldProps = Omit<ComponentProps<'textarea'>, 'value' | 'maxLength'> & {
  value: string
  // 초과 입력을 허용해 textarea maxLength로 넘기지 않고 글자 수 표시에만 사용
  maxLength: number
}

function TextAnswerField({
  value,
  maxLength,
  className,
  placeholder = '답변을 입력해 주세요',
  'aria-invalid': ariaInvalid,
  'aria-describedby': describedBy,
  ...props
}: TextAnswerFieldProps) {
  const counterId = useId()
  const length = getTextLength(value)
  const isOverLimit = length > maxLength

  return (
    <>
      <textarea
        value={value}
        placeholder={placeholder}
        aria-invalid={isOverLimit || ariaInvalid}
        aria-describedby={[describedBy, counterId].filter(Boolean).join(' ')}
        className={cn(
          'field-sizing-content w-full resize-none bg-transparent text-body2 font-normal break-words text-neutral outline-none placeholder:text-placeholder',
          className,
        )}
        {...props}
      />
      <p id={counterId} className="flex justify-end text-caption1">
        <span className={cn('font-semibold', isOverLimit ? 'text-critical' : 'text-neutral-muted')}>
          {length.toLocaleString('ko-KR')}
        </span>
        <span className="font-medium text-disabled">/{maxLength.toLocaleString('ko-KR')}자</span>
        {isOverLimit && <span className="sr-only">, 최대 글자 수를 넘었어요</span>}
      </p>
    </>
  )
}

export { TextAnswerField }
