'use client'

import AlertCircleIcon from '@/assets/icons/alertCircle.svg'
import CheckIcon from '@/assets/icons/check.svg'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import { cn } from '@/lib/utils'
import { formatSavedTime } from '@/utils/date'

type SaveState =
  | { status: 'idle' | 'saving' | 'failed' }
  // savedAt: 마지막 서버 저장 성공 시각
  | { status: 'saved'; savedAt: Date }

type SaveStatusProps = SaveState & {
  className?: string
}

// 상태 변화 안내용으로 idle에도 빈 영역 유지
function SaveStatus({ className, ...state }: SaveStatusProps) {
  return (
    <div
      role="status"
      data-slot="save-status"
      data-status={state.status}
      className={cn(
        'flex items-center gap-gap-xxs text-caption1 font-medium whitespace-nowrap',
        className,
      )}
    >
      <SaveStatusContent {...state} />
    </div>
  )
}

function SaveStatusContent(state: SaveState) {
  switch (state.status) {
    case 'idle':
      return null
    case 'saving':
      return (
        <>
          <SpinnerIcon
            aria-hidden
            className="size-4 shrink-0 text-neutral-subtle motion-safe:animate-spin"
          />
          <span className="text-neutral-subtle">저장 중…</span>
        </>
      )
    case 'saved':
      return (
        <>
          <CheckIcon aria-hidden className="size-4 shrink-0 text-positive" />
          {/* 스크린리더 단어 구분 */}
          <span className="sr-only">저장 완료</span>{' '}
          <time
            dateTime={state.savedAt.toISOString()}
            // 시간대 차이 hydration 경고 방지
            suppressHydrationWarning
            className="text-neutral-subtle"
          >
            {formatSavedTime(state.savedAt, new Date())}
          </time>
        </>
      )
    case 'failed':
      return (
        <>
          <AlertCircleIcon aria-hidden className="size-4 shrink-0 text-critical" />
          <span className="text-critical">저장 실패</span>
        </>
      )
  }
}

export { SaveStatus }
