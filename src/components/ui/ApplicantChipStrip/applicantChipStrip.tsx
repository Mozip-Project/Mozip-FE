'use client'

import ChevronLeftIcon from '@/assets/icons/chevronLeft.svg'
import ChevronRightIcon from '@/assets/icons/chevronRight.svg'
import { ApplicantChip } from '@/components/ui/ApplicantChip/applicantChip'
import { useHorizontalSlide } from '@/hooks/useHorizontalSlide'
import { cn } from '@/lib/utils'

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
  const currentIndex = applicants.findIndex((applicant) => applicant.id === currentId)
  const {
    viewportRef,
    listRef,
    offsetPx,
    isAnimated,
    canSlidePrev,
    canSlideNext,
    slidePrev,
    slideNext,
    revealItem,
  } = useHorizontalSlide(currentIndex)

  return (
    <div
      role="group"
      aria-label={label}
      data-slot="applicant-chip-strip"
      className={cn('flex w-full max-w-page min-w-70 items-center gap-gap-s', className)}
    >
      <SlideButton direction="prev" disabled={!canSlidePrev} onClick={slidePrev} />
      {/* overflow-clip: focus 시 자동 스크롤 방지 */}
      <div ref={viewportRef} className="min-w-0 flex-1 overflow-clip">
        <ul
          ref={listRef}
          role="list"
          className={cn(
            'flex w-max gap-gap-s',
            isAnimated &&
              'transition-transform duration-300 ease-out motion-reduce:transition-none',
          )}
          // 런타임 측정값이라 style 사용
          style={{ transform: `translateX(-${offsetPx}px)` }}
        >
          {applicants.map((applicant) => (
            <li key={applicant.id} onFocus={(event) => revealItem(event.currentTarget)}>
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
      <SlideButton direction="next" disabled={!canSlideNext} onClick={slideNext} />
    </div>
  )
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
