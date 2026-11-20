'use client'

import { useEffect, useRef, useState, type PointerEvent, type RefObject } from 'react'
import type { InterviewDay } from '@/features/posting/utils/interviewPeriod'
import { cn } from '@/lib/utils'
import { formatCalendarDateLabel } from '@/utils/calendar'
import { formatMonthDayWithWeekday } from '@/utils/date'
import { getScrollThumb, type ScrollThumb } from '@/utils/scrollThumb'

const NO_OVERFLOW = getScrollThumb({ scrollLeft: 0, scrollWidth: 0, clientWidth: 0 })

type InterviewDateStripProps = {
  documentResultDate: string
  finalResultDate: string
  days: InterviewDay[]
  selectedDates: string[]
  maxSelectable: number
  onToggle: (date: string) => void
  onLimitExceeded: () => void
}

function InterviewDateStrip({
  documentResultDate,
  finalResultDate,
  days,
  selectedDates,
  maxSelectable,
  onToggle,
  onLimitExceeded,
}: InterviewDateStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const thumb = useScrollThumb(scrollRef, days.length)
  const isLimitReached = selectedDates.length >= maxSelectable

  return (
    <div className="flex flex-col gap-2.5 rounded-l border border-neutral-muted bg-layer-default px-padding-m py-3.5">
      <div className="relative flex gap-gap-s">
        <BoundaryDate label="서류 발표" date={documentResultDate} />
        <div
          ref={scrollRef}
          className="flex min-w-0 flex-1 [scrollbar-width:none] gap-gap-s overflow-x-auto [&::-webkit-scrollbar]:hidden"
        >
          {days.map((day) => {
            const isSelected = selectedDates.includes(day.date)
            const isBlocked = !isSelected && isLimitReached

            return (
              <button
                key={day.date}
                type="button"
                aria-label={formatCalendarDateLabel(day.date)}
                aria-pressed={isSelected}
                aria-disabled={isBlocked || undefined}
                onClick={() => (isBlocked ? onLimitExceeded() : onToggle(day.date))}
                className={cn(
                  // 10일까지는 너비를 나눠 채우고, 더 길면 같은 너비로 가로 스크롤
                  'flex h-13 min-w-[calc((100%-var(--spacing-gap-s)*9)/10)] flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-m border border-transparent whitespace-nowrap outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid aria-disabled:cursor-default',
                  isSelected && 'border-brand-solid bg-brand-weak',
                  day.isSunday ? 'text-critical' : 'text-neutral',
                )}
              >
                <span
                  className={cn(
                    'text-caption1 font-normal',
                    !day.isSunday && 'text-neutral-subtle',
                  )}
                >
                  {day.weekday}
                </span>
                <span className="text-label1 font-medium">{day.dayLabel}</span>
              </button>
            )
          })}
        </div>
        <BoundaryDate label="최종 발표" date={finalResultDate} />
        {!thumb.isAtStart && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-19 w-[69px] bg-linear-to-l from-transparent via-(--background-color-layer-default) via-60% to-(--background-color-layer-default)"
          />
        )}
        {!thumb.isAtEnd && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-19 w-[69px] bg-linear-to-r from-transparent via-(--background-color-layer-default) via-60% to-(--background-color-layer-default)"
          />
        )}
      </div>
      {thumb.hasOverflow && <ScrollBar scrollRef={scrollRef} thumb={thumb} />}
    </div>
  )
}

function BoundaryDate({ label, date }: { label: string; date: string }) {
  return (
    <p className="flex h-13 w-19 shrink-0 flex-col items-center justify-center gap-0.5 rounded-m bg-neutral-weak px-padding-xs whitespace-nowrap">
      <span className="text-caption1 font-medium text-neutral-subtle">{label}</span>
      <span className="text-label2 font-semibold text-neutral-muted">
        {formatMonthDayWithWeekday(date)}
      </span>
    </p>
  )
}

type ScrollBarProps = {
  scrollRef: RefObject<HTMLDivElement | null>
  thumb: ScrollThumb
}

// 날짜 영역만 스크롤되지만 막대는 줄 전체 너비로 표시, 막대를 끌어 이동 가능
function ScrollBar({ scrollRef, thumb }: ScrollBarProps) {
  const dragStartRef = useRef<{ pointerX: number; scrollLeft: number } | null>(null)

  function handlePointerDown(event: PointerEvent<HTMLSpanElement>) {
    if (!scrollRef.current) {
      return
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    dragStartRef.current = { pointerX: event.clientX, scrollLeft: scrollRef.current.scrollLeft }
  }

  function handlePointerMove(event: PointerEvent<HTMLSpanElement>) {
    const scroller = scrollRef.current
    const track = event.currentTarget.parentElement
    if (!dragStartRef.current || !scroller || !track) {
      return
    }
    const scrollPerPixel = scroller.scrollWidth / track.clientWidth
    scroller.scrollLeft =
      dragStartRef.current.scrollLeft +
      (event.clientX - dragStartRef.current.pointerX) * scrollPerPixel
  }

  function handlePointerUp() {
    dragStartRef.current = null
  }

  return (
    <div aria-hidden className="relative h-1 overflow-hidden rounded-[2px] bg-neutral-weak">
      <span
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="absolute inset-y-0 left-0 cursor-pointer touch-none rounded-[2px] bg-(--text-color-neutral-faint)"
        style={{
          width: `${thumb.sizeRatio * 100}%`,
          transform: `translateX(${(thumb.offsetRatio / thumb.sizeRatio) * 100}%)`,
        }}
      />
    </div>
  )
}

// 날짜 수가 바뀌면 너비 변화 없이 스크롤 길이만 달라져 다시 계산
function useScrollThumb(scrollRef: RefObject<HTMLDivElement | null>, itemCount: number) {
  const [thumb, setThumb] = useState<ScrollThumb>(NO_OVERFLOW)

  useEffect(() => {
    const scroller = scrollRef.current
    if (!scroller) {
      return
    }

    function updateThumb() {
      if (scroller) {
        setThumb(getScrollThumb(scroller))
      }
    }

    updateThumb()
    scroller.addEventListener('scroll', updateThumb, { passive: true })
    const resizeObserver = new ResizeObserver(updateThumb)
    resizeObserver.observe(scroller)

    return () => {
      scroller.removeEventListener('scroll', updateThumb)
      resizeObserver.disconnect()
    }
  }, [scrollRef, itemCount])

  return thumb
}

export { InterviewDateStrip }
