import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getInterviewPeriod } from '@/features/posting/utils/interviewPeriod'
import { InterviewDateStrip } from './interviewDateStrip'

// jsdom 미지원
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const DAYS = getInterviewPeriod('2026-10-22', '2026-10-30')?.days ?? []
const SELECTED = ['2026-10-23', '2026-10-24', '2026-10-25', '2026-10-26', '2026-10-27']

describe('InterviewDateStrip', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverStub)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('최대 개수를 고르면 남은 날짜는 막혀 안내 콜백만 호출, 고른 날짜는 해제 가능', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    const onLimitExceeded = vi.fn()
    render(
      <InterviewDateStrip
        documentResultDate="2026-10-22"
        finalResultDate="2026-10-30"
        days={DAYS}
        selectedDates={SELECTED}
        maxSelectable={5}
        onToggle={onToggle}
        onLimitExceeded={onLimitExceeded}
      />,
    )

    const blocked = screen.getByRole('button', { name: '2026년 10월 28일 수요일' })
    expect(blocked).toHaveAttribute('aria-disabled', 'true')
    await user.click(blocked)
    expect(onToggle).not.toHaveBeenCalled()
    expect(onLimitExceeded).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: '2026년 10월 23일 금요일' }))
    expect(onToggle).toHaveBeenCalledWith('2026-10-23')
  })
})
