import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Toast, ToastProvider, ToastViewport } from './toast'

const TITLE = '임시 저장했어요'

function renderOpenToast() {
  const onOpenChange = vi.fn()
  render(
    <ToastProvider>
      <Toast open onOpenChange={onOpenChange} title={TITLE} description="설명" />
      <ToastViewport />
    </ToastProvider>,
  )
  return { onOpenChange }
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('제목과 설명 표시', () => {
    renderOpenToast()

    expect(screen.getByText(TITLE)).toBeInTheDocument()
    expect(screen.getByText('설명')).toBeInTheDocument()
  })

  it('알림 영역과 읽기 문구를 한국어 이름으로 표시', () => {
    renderOpenToast()
    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(screen.getByRole('region', { name: '알림 (F8)' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(`알림 ${TITLE}`)
  })

  it('호출자가 넘긴 label 우선 적용', () => {
    render(
      <ToastProvider>
        <ToastViewport label="저장 알림 ({hotkey})" />
      </ToastProvider>,
    )

    expect(screen.getByRole('region', { name: '저장 알림 (F8)' })).toBeInTheDocument()
  })

  it('3초 뒤 자동으로 닫힘', () => {
    const { onOpenChange } = renderOpenToast()

    act(() => {
      vi.advanceTimersByTime(2999)
    })
    expect(onOpenChange).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('마우스를 올린 동안 타이머 정지', () => {
    const { onOpenChange } = renderOpenToast()
    const viewport = screen.getByRole('region')

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    fireEvent.pointerMove(viewport)
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(onOpenChange).not.toHaveBeenCalled()

    fireEvent.pointerLeave(viewport)
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
