import { Tooltip } from '@/components/ui/Tooltip/tooltip'
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

type OpinionBarProps = {
  opinionCounts: OpinionCounts
}

// 평가자 1명당 1칸, 합격·보류·불합격·미평가 순
function OpinionBar({ opinionCounts }: OpinionBarProps) {
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

  return (
    <Tooltip label={summary}>
      {/* 툴팁과 같은 문구를 스크린 리더에도 전달, 키보드 focus로도 툴팁 노출 */}
      <span
        role="img"
        tabIndex={0}
        aria-label={`평가자 의견 ${summary}`}
        data-slot="opinion-bar"
        className={cn(
          'flex h-2 max-w-30 min-w-0 flex-1 overflow-hidden rounded-full',
          'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
        )}
      >
        {segments.map(({ key, opinion }) => (
          <span key={key} className={cn('h-2 flex-1', OPINION_SEGMENT_CLASS[opinion])} />
        ))}
      </span>
    </Tooltip>
  )
}

export { OpinionBar }
export type { OpinionCounts }
