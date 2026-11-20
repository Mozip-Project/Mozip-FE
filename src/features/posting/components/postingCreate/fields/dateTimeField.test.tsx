import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { TimeOptionType } from '@/utils/time'
import { DateTimeField } from './dateTimeField'

// jsdom 미지원
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function ControlledDateTimeField({ timeType }: { timeType: TimeOptionType }) {
  const [date, setDate] = useState<string | null>(null)
  const [time, setTime] = useState<string | null>(null)

  return (
    <DateTimeField
      label="모집 마감"
      timeType={timeType}
      date={date}
      onDateChange={setDate}
      time={time}
      onTimeChange={setTime}
    />
  )
}

describe('DateTimeField', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverStub)
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 1, 10, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it.each([
    ['start', '오전 12:00'],
    ['end', '오후 11:59'],
  ] as const)(
    '%s 시간 안내 문구는 %s, 날짜를 처음 고르면 그 시간으로 채움',
    async (timeType, label) => {
      const user = userEvent.setup()
      render(<ControlledDateTimeField timeType={timeType} />)

      await user.click(screen.getByRole('button', { name: `시간 ${label}` }))
      expect(await screen.findByRole('menuitemradio', { name: label })).toHaveAttribute(
        'aria-checked',
        'false',
      )
      await user.keyboard('{Escape}')

      await user.click(screen.getByRole('button', { name: /^날짜/ }))
      await user.click(await screen.findByRole('button', { name: '2026년 10월 8일 목요일' }))
      expect(screen.getByRole('button', { name: /^날짜/ })).toHaveTextContent('2026. 10. 08 (목)')

      await user.click(screen.getByRole('button', { name: `시간 ${label}` }))
      expect(await screen.findByRole('menuitemradio', { name: label })).toHaveAttribute(
        'aria-checked',
        'true',
      )
    },
  )
})
