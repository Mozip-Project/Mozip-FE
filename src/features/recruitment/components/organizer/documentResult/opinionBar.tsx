'use client'

import { Fragment, useEffect, useRef, useState, type PointerEvent } from 'react'
import { Tooltip, TOOLTIP_SHOW_DELAY_MS } from '@/components/ui/Tooltip/tooltip'
import {
  DOCUMENT_RESULT_STATUS_LABEL,
  DOCUMENT_RESULTS,
  type DocumentResult,
} from '@/features/recruitment/types'
import { cn } from '@/lib/utils'

const OPINIONS = [...DOCUMENT_RESULTS, 'pending'] as const

type Opinion = (typeof OPINIONS)[number]

// 미평가는 평가 진행 중에만 전달
type OpinionCounts = Record<DocumentResult, number> & { pending?: number }

const OPINION_LABEL = {
  ...DOCUMENT_RESULT_STATUS_LABEL,
  pending: '미평가',
} satisfies Record<Opinion, string>

const OPINION_SEGMENT_CLASS = {
  pass: 'bg-brand-solid',
  hold: 'bg-warning-solid',
  fail: 'bg-critical-solid',
  pending: 'bg-neutral-weak',
} satisfies Record<Opinion, string>

// 툴팁 화살표 기준 칸 수, 두 의견으로 나뉠 때만 그 경계 앞 칸 수, 한 의견·세 의견 이상은 null(가운데)
function getBoundarySegmentCount(counts: readonly number[]) {
  const filledCounts = counts.filter((count) => count > 0)
  return filledCounts.length === 2 ? (filledCounts[0] ?? null) : null
}

type OpinionBarProps = {
  opinionCounts: OpinionCounts
}

function OpinionBar({ opinionCounts }: OpinionBarProps) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  const showTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const visibleOpinions = OPINIONS.filter(
    (opinion) => opinion !== 'pending' || (opinionCounts.pending ?? 0) > 0,
  )
  const summary = visibleOpinions
    .map((opinion) => `${OPINION_LABEL[opinion]} ${opinionCounts[opinion] ?? 0}`)
    .join(' · ')
  const segments = visibleOpinions.flatMap((opinion) =>
    Array.from({ length: opinionCounts[opinion] ?? 0 }, (_, index) => ({
      key: `${opinion}-${index}`,
      opinion,
    })),
  )
  const boundarySegmentCount = getBoundarySegmentCount(
    visibleOpinions.map((opinion) => opinionCounts[opinion] ?? 0),
  )

  useEffect(() => () => clearTimeout(showTimerRef.current), [])

  // 기본 툴팁처럼 터치는 제외하고 마우스만 지연 표시
  function handlePointerEnter(event: PointerEvent) {
    if (event.pointerType === 'touch') {
      return
    }
    clearTimeout(showTimerRef.current)
    showTimerRef.current = setTimeout(() => setIsTooltipOpen(true), TOOLTIP_SHOW_DELAY_MS)
  }

  function hideTooltip() {
    clearTimeout(showTimerRef.current)
    setIsTooltipOpen(false)
  }

  const tooltipAnchor = (
    <Tooltip label={summary} open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
      <span
        aria-hidden
        className={cn(
          'h-2 w-0 shrink-0',
          boundarySegmentCount === null && 'absolute top-0 left-1/2',
        )}
      />
    </Tooltip>
  )

  return (
    // 툴팁과 같은 문구를 스크린 리더에도 전달, 키보드 focus로도 툴팁 노출
    <span
      role="img"
      tabIndex={0}
      aria-label={`평가자 의견 ${summary}`}
      data-slot="opinion-bar"
      className={cn(
        'relative flex h-2 max-w-30 min-w-0 flex-1 overflow-hidden rounded-full',
        'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
      )}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={hideTooltip}
      onFocus={() => setIsTooltipOpen(true)}
      onBlur={hideTooltip}
    >
      {/* 두 의견이면 경계 칸 앞에 폭 0인 기준점 배치 */}
      {segments.map(({ key, opinion }, index) => (
        <Fragment key={key}>
          {index === boundarySegmentCount && tooltipAnchor}
          <span className={cn('h-2 flex-1', OPINION_SEGMENT_CLASS[opinion])} />
        </Fragment>
      ))}
      {boundarySegmentCount === null && tooltipAnchor}
    </span>
  )
}

export { OpinionBar }
