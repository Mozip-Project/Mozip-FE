'use client'

import { Toast as ToastPrimitive } from 'radix-ui'
import CheckIcon from '@/assets/icons/check.svg'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

// Figma 사양: 3초 뒤 자동 닫힘, 마우스를 올리면 타이머 정지(Radix 기본 동작)
const TOAST_DURATION_MS = 3000

function ToastProvider({
  duration = TOAST_DURATION_MS,
  label = '알림',
  ...props
}: ComponentProps<typeof ToastPrimitive.Provider>) {
  return <ToastPrimitive.Provider duration={duration} label={label} {...props} />
}

function ToastViewport({
  className,
  // {hotkey}는 Radix가 실제 단축키(F8)로 치환
  label = '알림 ({hotkey})',
  ...props
}: ComponentProps<typeof ToastPrimitive.Viewport>) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      label={label}
      className={cn(
        // 화면 하단 중앙, 아래에서 20px
        'pointer-events-none fixed inset-x-0 bottom-5 z-50 flex flex-col items-center gap-gap-s px-page-padding outline-none',
        className,
      )}
      {...props}
    />
  )
}

type ToastProps = Omit<ComponentProps<typeof ToastPrimitive.Root>, 'title'> & {
  title: string
  description?: string
}

function Toast({ title, description, className, type = 'background', ...props }: ToastProps) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      // 저장 완료 같은 결과 안내는 polite로 전달
      type={type}
      className={cn(
        'pointer-events-auto flex max-w-full items-center gap-gap-s rounded-m bg-neutral-solid px-padding-m py-padding-s shadow-floating',
        'duration-200 data-[state=open]:animate-in data-[state=open]:ease-out data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-2',
        'data-[state=closed]:animate-out data-[state=closed]:ease-in data-[state=closed]:fade-out-0',
        // data-[state] 선택자로 등장·퇴장 클래스와 우선순위를 맞춰 reduced motion 적용
        'motion-reduce:data-[state]:animate-none',
        className,
      )}
      {...props}
    >
      <CheckIcon aria-hidden className="shrink-0 text-brand" />
      <ToastPrimitive.Title className="shrink-0 text-label1 font-semibold whitespace-nowrap text-on-neutral-solid">
        {title}
      </ToastPrimitive.Title>
      {description && (
        <ToastPrimitive.Description className="min-w-0 text-label2 text-neutral-faint">
          {description}
        </ToastPrimitive.Description>
      )}
    </ToastPrimitive.Root>
  )
}

export { Toast, ToastProvider, ToastViewport }
