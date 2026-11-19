import { describe, expect, it } from 'vitest'
import { createTimeOptions, formatTimeLabel, getDefaultTime } from './time'

describe('formatTimeLabel', () => {
  it('오전·오후 12시간제, 시는 두 자리로 표시', () => {
    expect(formatTimeLabel('00:00')).toBe('오전 12:00')
    expect(formatTimeLabel('01:30')).toBe('오전 01:30')
    expect(formatTimeLabel('12:00')).toBe('오후 12:00')
    expect(formatTimeLabel('23:59')).toBe('오후 11:59')
  })
})

describe('createTimeOptions', () => {
  it('시작은 00:00부터 간격마다 23:30까지', () => {
    const options = createTimeOptions(30, 'start')

    expect(options).toHaveLength(48)
    expect(options[0]).toEqual({ value: '00:00', label: '오전 12:00' })
    expect(options.at(-1)).toEqual({ value: '23:30', label: '오후 11:30' })
  })

  it('마감은 첫 간격부터 시작해 23:59로 끝남', () => {
    const options = createTimeOptions(30, 'end')

    expect(options).toHaveLength(48)
    expect(options[0]).toEqual({ value: '00:30', label: '오전 12:30' })
    expect(options.at(-2)?.value).toBe('23:30')
    expect(options.at(-1)).toEqual({ value: '23:59', label: '오후 11:59' })
  })
})

describe('getDefaultTime', () => {
  it('시작은 자정, 마감은 당일 23:59', () => {
    expect(getDefaultTime('start')).toBe('00:00')
    expect(getDefaultTime('end')).toBe('23:59')
  })
})
