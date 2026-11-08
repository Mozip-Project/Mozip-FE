import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider, useToast } from '@/providers/toastProvider'

function ShowToastButton({ title }: { title: string }) {
  const { showToast } = useToast()

  return (
    <button type="button" onClick={() => showToast({ title })}>
      {title} 띄우기
    </button>
  )
}

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('showToast로 넘긴 문구 표시', () => {
    render(
      <ToastProvider>
        <ShowToastButton title="평가를 저장했어요" />
      </ToastProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: '평가를 저장했어요 띄우기' }))

    expect(screen.getByText('평가를 저장했어요')).toBeInTheDocument()
  })

  it('연달아 호출하면 이전 토스트를 닫고 마지막 토스트만 표시', () => {
    render(
      <ToastProvider>
        <ShowToastButton title="첫 번째" />
        <ShowToastButton title="두 번째" />
      </ToastProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: '첫 번째 띄우기' }))
    fireEvent.click(screen.getByRole('button', { name: '두 번째 띄우기' }))

    expect(screen.queryByText('첫 번째')).not.toBeInTheDocument()
    expect(screen.getByText('두 번째')).toBeInTheDocument()
  })

  it('3초 뒤 닫히면 화면에서 제거', () => {
    render(
      <ToastProvider>
        <ShowToastButton title="평가를 저장했어요" />
      </ToastProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: '평가를 저장했어요 띄우기' }))
    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(screen.queryByText('평가를 저장했어요')).not.toBeInTheDocument()
  })

  it('ToastProvider 밖에서 useToast를 쓰면 오류', () => {
    // React가 남기는 렌더 오류 로그 숨김
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<ShowToastButton title="평가를 저장했어요" />)).toThrow(
      'useToast는 ToastProvider 안에서만 사용 가능',
    )

    consoleError.mockRestore()
  })
})
