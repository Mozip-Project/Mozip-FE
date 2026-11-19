type TimeOptionType = 'start' | 'end'

type TimeOption = {
  value: string
  label: string
}

const MINUTES_PER_DAY = 24 * 60
const END_OF_DAY_TIME = '23:59'

const DEFAULT_TIME = {
  start: '00:00',
  end: END_OF_DAY_TIME,
} satisfies Record<TimeOptionType, string>

function toTimeValue(totalMinutes: number) {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
  const minutes = String(totalMinutes % 60).padStart(2, '0')

  return `${hours}:${minutes}`
}

function formatTimeLabel(time: string) {
  const [hours = 0, minutes = 0] = time.split(':').map(Number)
  const period = hours < 12 ? '오전' : '오후'
  const displayHours = String(hours % 12 || 12).padStart(2, '0')

  return `${period} ${displayHours}:${String(minutes).padStart(2, '0')}`
}

// 마감은 자정이 아닌 당일 23:59로 끝냄
function createTimeOptions(intervalMinutes: number, type: TimeOptionType): TimeOption[] {
  const firstMinutes = type === 'start' ? 0 : intervalMinutes
  const values: string[] = []

  for (let minutes = firstMinutes; minutes < MINUTES_PER_DAY; minutes += intervalMinutes) {
    values.push(toTimeValue(minutes))
  }

  if (type === 'end') {
    values.push(END_OF_DAY_TIME)
  }

  return values.map((value) => ({ value, label: formatTimeLabel(value) }))
}

function getDefaultTime(type: TimeOptionType) {
  return DEFAULT_TIME[type]
}

export { createTimeOptions, formatTimeLabel, getDefaultTime, toTimeValue }
export type { TimeOption, TimeOptionType }
