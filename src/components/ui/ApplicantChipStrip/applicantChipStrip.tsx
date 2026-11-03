'use client'

import { useEffect, useLayoutEffect, useRef, useState, type FocusEvent } from 'react'
import ChevronLeftIcon from '@/assets/icons/chevronLeft.svg'
import ChevronRightIcon from '@/assets/icons/chevronRight.svg'
import { ApplicantChip } from '@/components/ui/ApplicantChip/applicantChip'
import { cn } from '@/lib/utils'
import { getRevealOffset, getSlideOffset } from '@/utils/slideOffset'

type StripApplicant = {
  id: string
  name: string
  isDone: boolean
}

type ApplicantChipStripProps = {
  label: string
  applicants: readonly StripApplicant[]
  currentId: string
  onSelect: (id: string) => void
  className?: string
}

function ApplicantChipStrip({
  label,
  applicants,
  currentId,
  onSelect,
  className,
}: ApplicantChipStripProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [offset, setOffset] = useState(0)
  const [maxOffset, setMaxOffset] = useState(0)
  const [isPositioned, setIsPositioned] = useState(false)

  const visibleOffset = Math.min(offset, maxOffset)
  const canSlidePrev = visibleOffset > 0
  const canSlideNext = visibleOffset < maxOffset

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const list = listRef.current
    if (!viewport || !list) {
      return
    }

    const updateMaxOffset = () => {
      setMaxOffset(Math.max(list.scrollWidth - viewport.clientWidth, 0))
    }
    updateMaxOffset()
    const observer = new ResizeObserver(updateMaxOffset)
    observer.observe(viewport)
    observer.observe(list)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    const currentItem = listRef.current?.querySelector<HTMLElement>(
      `[data-applicant-id="${CSS.escape(currentId)}"]`,
    )
    if (currentItem) {
      setOffset((previousPx) => getItemRevealOffset(previousPx, currentItem, viewportRef.current))
    }
  }, [currentId])

  // 첫 위치는 애니메이션 없이 적용
  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsPositioned(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  // 연속 클릭 시 목표 위치 누적
  function slideBy(direction: 1 | -1) {
    const stepPx = getSlideStep(listRef.current)
    setOffset((previous) =>
      getSlideOffset(Math.min(previous, maxOffset), direction * stepPx, maxOffset),
    )
  }

  function handleItemFocus(event: FocusEvent<HTMLLIElement>) {
    const item = event.currentTarget
    setOffset((previousPx) => getItemRevealOffset(previousPx, item, viewportRef.current))
  }

  return (
    <div
      role="group"
      aria-label={label}
      data-slot="applicant-chip-strip"
      className={cn('flex w-full max-w-page min-w-70 items-center gap-gap-s', className)}
    >
      <SlideButton direction="prev" disabled={!canSlidePrev} onClick={() => slideBy(-1)} />
      {/* overflow-clip: focus 시 자동 스크롤 방지 */}
      <div ref={viewportRef} className="min-w-0 flex-1 overflow-clip">
        <ul
          ref={listRef}
          role="list"
          className={cn(
            'flex w-max gap-gap-s',
            isPositioned &&
              'transition-transform duration-300 ease-out motion-reduce:transition-none',
          )}
          // 런타임 측정값이라 style 사용
          style={{ transform: `translateX(-${visibleOffset}px)` }}
        >
          {applicants.map((applicant) => (
            <li key={applicant.id} data-applicant-id={applicant.id} onFocus={handleItemFocus}>
              <ApplicantChip
                name={applicant.name}
                isDone={applicant.isDone}
                isCurrent={applicant.id === currentId}
                onClick={() => onSelect(applicant.id)}
              />
            </li>
          ))}
        </ul>
      </div>
      <SlideButton direction="next" disabled={!canSlideNext} onClick={() => slideBy(1)} />
    </div>
  )
}

function getSlideStep(list: HTMLElement | null) {
  const [firstItem, secondItem] = list?.children ?? []
  if (!(firstItem instanceof HTMLElement) || !(secondItem instanceof HTMLElement)) {
    return 0
  }
  return secondItem.offsetLeft - firstItem.offsetLeft
}

function getItemRevealOffset(previousPx: number, item: HTMLElement, viewport: HTMLElement | null) {
  return getRevealOffset({
    previousPx,
    itemStartPx: item.offsetLeft,
    itemEndPx: item.offsetLeft + item.offsetWidth,
    viewportWidthPx: viewport?.clientWidth ?? 0,
  })
}

const SLIDE_BUTTON_CONTENT = {
  prev: { Icon: ChevronLeftIcon, label: '이전 지원자 보기' },
  next: { Icon: ChevronRightIcon, label: '다음 지원자 보기' },
} satisfies Record<'prev' | 'next', object>

type SlideButtonProps = {
  direction: keyof typeof SLIDE_BUTTON_CONTENT
  disabled: boolean
  onClick: () => void
}

function SlideButton({ direction, disabled, onClick }: SlideButtonProps) {
  const { Icon, label } = SLIDE_BUTTON_CONTENT[direction]

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-m border border-neutral-muted bg-layer-default text-neutral-muted',
        'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
        'disabled:cursor-default disabled:text-disabled',
      )}
    >
      <Icon aria-hidden className="size-4" />
    </button>
  )
}

export { ApplicantChipStrip }
export type { StripApplicant }
