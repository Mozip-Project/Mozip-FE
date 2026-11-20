import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DatePicker } from './datePicker'

describe('DatePicker', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 3, 10, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('값이 없으면 오늘 날짜를 선택 상태로 표시', () => {
    render(<DatePicker value={null} onValueChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: '2026년 10월 3일 토요일' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('최소 날짜 이전은 선택 불가, 이후 날짜는 선택', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<DatePicker value={null} onValueChange={handleChange} minDate="2026-10-09" />)

    const disabledDay = screen.getByRole('button', { name: '2026년 10월 8일 목요일' })
    expect(disabledDay).toHaveAttribute('aria-disabled', 'true')
    await user.click(disabledDay)
    expect(handleChange).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: '2026년 10월 9일 금요일' }))
    expect(handleChange).toHaveBeenCalledExactlyOnceWith('2026-10-09')
  })

  it('이전·다음 달 버튼으로 표시 달 변경', async () => {
    const user = userEvent.setup()
    render(<DatePicker value={null} onValueChange={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: '다음 달' }))
    expect(screen.getByText('2026년 11월')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '이전 달' }))
    await user.click(screen.getByRole('button', { name: '이전 달' }))
    expect(screen.getByText('2026년 9월')).toBeInTheDocument()
  })
})
