'use client'

import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type CompositionEvent,
} from 'react'
import { cn } from '@/lib/utils'
import { getTextLength, trimTextBeforeCaret } from '@/utils/text'

type TextAreaProps = ComponentProps<'textarea'>

// 브라우저 maxLength는 이모지를 2자로 세서 쓰지 않고 getTextLength 기준으로 직접 제한
function getTrimmedInput(textarea: HTMLTextAreaElement, maxLength: number) {
  const trimmed = trimTextBeforeCaret(textarea.value, textarea.selectionEnd, maxLength)
  return trimmed.text === textarea.value ? null : trimmed
}

function TextArea({
  className,
  maxLength,
  value,
  defaultValue,
  onChange,
  onCompositionStart,
  onCompositionEnd,
  'aria-describedby': describedBy,
  ...props
}: TextAreaProps) {
  const counterId = useId()
  const isComposingRef = useRef(false)
  const [uncontrolledLength, setUncontrolledLength] = useState(
    getTextLength(String(defaultValue ?? '')),
  )
  const length = value === undefined ? uncontrolledLength : getTextLength(String(value))
  const hasCounter = maxLength !== undefined
  const descriptionIds = [describedBy, hasCounter && counterId].filter(Boolean).join(' ')

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    // 한글 조합 중에 자르면 조합이 깨져 조합이 끝난 뒤 처리
    const trimmed =
      maxLength !== undefined && !isComposingRef.current
        ? getTrimmedInput(event.target, maxLength)
        : null

    if (trimmed) {
      event.target.value = trimmed.text
      event.target.setSelectionRange(trimmed.caret, trimmed.caret)
    }

    setUncontrolledLength(getTextLength(event.target.value))
    onChange?.(event)
  }

  function handleCompositionStart(event: CompositionEvent<HTMLTextAreaElement>) {
    isComposingRef.current = true
    onCompositionStart?.(event)
  }

  function handleCompositionEnd(event: CompositionEvent<HTMLTextAreaElement>) {
    isComposingRef.current = false
    onCompositionEnd?.(event)

    const textarea = event.currentTarget
    const trimmed = maxLength === undefined ? null : getTrimmedInput(textarea, maxLength)

    if (!trimmed) {
      return
    }

    // Chrome은 조합 끝 뒤 input 이벤트가 없어 직접 발생, React가 감지하도록 네이티브 setter 사용
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set?.call(
      textarea,
      trimmed.text,
    )
    textarea.setSelectionRange(trimmed.caret, trimmed.caret)
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
  }

  return (
    // 최소 높이는 className으로 조정
    <div data-slot="text-area" className={cn('relative flex min-h-24 flex-col', className)}>
      <textarea
        data-slot="text-area-input"
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        aria-describedby={descriptionIds || undefined}
        className={cn(
          'field-sizing-content min-h-0 w-full flex-1 resize-none rounded-m border border-neutral-muted bg-layer-default px-padding-m py-padding-s text-body2 font-normal text-neutral placeholder:text-placeholder',
          'transition-colors outline-none focus:border-brand-solid motion-reduce:transition-none',
          'read-only:border-neutral-subtle read-only:bg-neutral-weak',
          // 카운터 높이만큼 하단 여백 확보
          hasCounter && 'pb-7',
        )}
        {...props}
      />
      {hasCounter && (
        <p
          id={counterId}
          data-slot="text-area-counter"
          className="pointer-events-none absolute right-padding-m bottom-padding-s text-caption1 font-medium text-disabled"
        >
          <span className={cn('font-semibold', length > 0 && 'text-neutral-muted')}>
            {length.toLocaleString('ko-KR')}
          </span>
          {`/${maxLength.toLocaleString('ko-KR')}`}
        </p>
      )}
    </div>
  )
}

export { TextArea }
