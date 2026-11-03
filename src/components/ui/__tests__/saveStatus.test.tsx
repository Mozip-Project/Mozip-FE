import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SaveStatus } from '@/components/ui/SaveStatus/saveStatus'

describe('SaveStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 4, 15, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('입력 전에는 빈 status 영역만 유지', () => {
    render(<SaveStatus status="idle" />)

    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('저장 중·실패 문구 표시', () => {
    const { rerender } = render(<SaveStatus status="saving" />)
    expect(screen.getByRole('status')).toHaveTextContent('저장 중…')

    rerender(<SaveStatus status="failed" />)
    expect(screen.getByRole('status')).toHaveTextContent('저장 실패')
  })

  it('저장 완료 시 저장 시각 표시', () => {
    const { rerender } = render(
      <SaveStatus status="saved" savedAt={new Date(2026, 10, 4, 14, 32)} />,
    )
    expect(screen.getByRole('status')).toHaveTextContent('저장 완료 14:32')

    rerender(<SaveStatus status="saved" savedAt={new Date(2026, 10, 3, 14, 32)} />)
    expect(screen.getByRole('status')).toHaveTextContent('11/3 (화) 14:32')
  })
})
