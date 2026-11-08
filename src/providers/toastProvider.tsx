'use client'

import { createContext, use, useRef, useState, type ReactNode } from 'react'
import {
  Toast,
  ToastProvider as RadixToastProvider,
  ToastViewport,
} from '@/components/ui/Toast/toast'

type ToastMessage = {
  title: string
  description?: string
}

type ToastItem = ToastMessage & {
  id: number
  isOpen: boolean
}

const ShowToastContext = createContext<((message: ToastMessage) => void) | null>(null)

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextIdRef = useRef(0)

  // 한 번에 하나만 표시, 열려 있던 토스트는 닫힘 애니메이션 후 교체
  function showToast(message: ToastMessage) {
    const id = nextIdRef.current++
    setToasts((previous) => [
      ...previous.filter((toast) => toast.isOpen).map((toast) => ({ ...toast, isOpen: false })),
      { ...message, id, isOpen: true },
    ])
  }

  function closeToast(id: number) {
    setToasts((previous) =>
      previous.map((toast) => (toast.id === id ? { ...toast, isOpen: false } : toast)),
    )
  }

  return (
    <ShowToastContext value={showToast}>
      <RadixToastProvider>
        {children}
        {toasts.map(({ id, title, description, isOpen }) => (
          <Toast
            key={id}
            open={isOpen}
            onOpenChange={(open) => {
              if (!open) {
                closeToast(id)
              }
            }}
            title={title}
            description={description}
          />
        ))}
        <ToastViewport />
      </RadixToastProvider>
    </ShowToastContext>
  )
}

function useToast() {
  const showToast = use(ShowToastContext)

  if (!showToast) {
    throw new Error('useToast는 ToastProvider 안에서만 사용 가능')
  }

  return { showToast }
}

export { ToastProvider, useToast }
export type { ToastMessage }
