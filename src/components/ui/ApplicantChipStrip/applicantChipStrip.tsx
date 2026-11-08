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
  const { viewportRef, listRef, canSlidePrev, canSlideNext, slidePrev, slideNext } =
    useHorizontalSlide(currentIndex)

  return (
    <div
      role="group"
      aria-label={label}
      data-slot="applicant-chip-strip"
      className={cn('flex w-full max-w-page min-w-70 items-center gap-gap-s', className)}
    >
      <SlideButton direction="prev" disabled={!canSlidePrev} onClick={slidePrev} />
      <div
        ref={viewportRef}
        className={cn(
          // relative: 칩 안 sr-only(absolute)가 스크롤 영역 밖으로 페이지 폭을 늘리는 문제 방지
          'relative min-w-0 flex-1 overflow-x-auto overscroll-x-contain',
          'scroll-smooth motion-reduce:scroll-auto',
          // 스크롤바는 숨기고 버튼·트랙패드·터치로 이동(마우스 세로 휠은 Shift 필요)
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          // 칩 포커스 링이 스크롤 영역에 잘리지 않게 여백 확보
          '-m-1 p-1',
        )}
      >
        <ul ref={listRef} role="list" className="flex w-max gap-gap-s">
          {applicants.map((applicant) => (
            <li key={applicant.id}>
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
