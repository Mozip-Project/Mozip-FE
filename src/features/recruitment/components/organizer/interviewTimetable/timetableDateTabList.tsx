import { useEffect, useRef, type DragEvent } from 'react'
import ClockIcon from '@/assets/icons/clock.svg'
import { TabsList, TabsTrigger } from '@/components/ui/Tabs/tabs'
import { formatMonthDayWithWeekday } from '@/utils/date'

// 끄는 중 탭 위에 이만큼 머물면 날짜 전환
const DATE_SWITCH_DELAY_MS = 600

// available: 끄는 중 놓을 수 있는 칸 있음, blocked: 그날 확정을 막는 항목 남음
type TimetableDateStatus = 'available' | 'blocked'

const DATE_STATUS = {
  available: { tone: 'positive', label: '배정 가능한 칸 있음' },
  blocked: { tone: 'critical', label: '확정 전 남은 항목 있음' },
} as const satisfies Record<TimetableDateStatus, { tone: 'positive' | 'critical'; label: string }>

type TimetableDateTab = {
  date: string
  assignedCount: number
  status: TimetableDateStatus | null
}

type TimetableDateTabListProps = {
  tabs: TimetableDateTab[]
  selectedDate: string
  isDragging: boolean
  interviewRuleLabel: string
  onDateChange: (date: string) => void
}

function TimetableDateTabList({
  tabs,
  selectedDate,
  isDragging,
  interviewRuleLabel,
  onDateChange,
}: TimetableDateTabListProps) {
  const switchTimerRef = useRef<number | null>(null)

  function clearSwitchTimer() {
    if (switchTimerRef.current !== null) {
      window.clearTimeout(switchTimerRef.current)
      switchTimerRef.current = null
    }
  }

  useEffect(() => clearSwitchTimer, [])

  function handleDragEnter(date: string) {
    if (!isDragging || date === selectedDate) {
      return
    }
    clearSwitchTimer()
    switchTimerRef.current = window.setTimeout(() => onDateChange(date), DATE_SWITCH_DELAY_MS)
  }

  function handleDragLeave(event: DragEvent<HTMLButtonElement>) {
    const nextTarget = event.relatedTarget
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return
    }
    clearSwitchTimer()
  }

  return (
    <div className="relative flex items-center gap-gap-s">
      {/* 높이에 더하지 않고 탭 표시선 아래에 깔리는 기준선 */}
      <span aria-hidden className="absolute inset-x-0 bottom-0 border-b border-neutral-subtle" />
      <TabsList aria-label="면접 날짜" className="min-w-0 flex-1 overflow-x-auto">
        {tabs.map(({ date, assignedCount, status }) => (
          <TabsTrigger
            key={date}
            value={date}
            status={status ? DATE_STATUS[status] : undefined}
            onDragEnter={() => handleDragEnter(date)}
            onDragLeave={handleDragLeave}
          >
            {/* 화면에서는 flex 간격, 접근 가능한 이름에서는 공백으로 구분 */}
            <span>{formatMonthDayWithWeekday(date)}</span> <span>{assignedCount}명</span>
          </TabsTrigger>
        ))}
      </TabsList>
      <p className="flex shrink-0 items-center gap-gap-xs text-caption1 font-medium text-neutral-subtle">
        <ClockIcon aria-hidden className="size-4" />
        {interviewRuleLabel}
      </p>
    </div>
  )
}

export { TimetableDateTabList }
export type { TimetableDateStatus, TimetableDateTab }
