import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Tooltip } from '@/components/ui/Tooltip/tooltip'

function renderTooltip() {
  render(
    <Tooltip label="합격 2 · 보류 1 · 불합격 0">
      <button type="button">평가 현황</button>
    </Tooltip>,
  )
  return { trigger: screen.getByRole('button', { name: '평가 현황' }) }
}

// jsdom 미지원, Radix 화살표 크기 측정용
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('Tooltip', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverStub)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('hover 후 300ms가 지나야 노출', () => {
    vi.useFakeTimers()
    const { trigger } = renderTooltip()

    fireEvent.pointerMove(trigger)
    act(() => {
      vi.advanceTimersByTime(299)
    })
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(screen.getByRole('tooltip')).toHaveTextContent('합격 2 · 보류 1 · 불합격 0')
  })

  it('키보드 focus 시 노출하고 트리거 설명으로 연결', async () => {
    const user = userEvent.setup()
    const { trigger } = renderTooltip()

    await user.tab()

    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    expect(trigger).toHaveAccessibleDescription('합격 2 · 보류 1 · 불합격 0')
  })

  it('Esc로 닫힘', async () => {
    const user = userEvent.setup()
    renderTooltip()

    await user.tab()
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })
})
