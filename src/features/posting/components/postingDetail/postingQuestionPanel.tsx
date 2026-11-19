import { Badge } from '@/components/ui/Badge/badge'
import { SectionHeader } from '@/components/ui/SectionHeader/sectionHeader'
import type { PostingQuestion } from '@/features/posting/types'

type PostingQuestionPanelProps = {
  questions: readonly PostingQuestion[]
}

function PostingQuestionPanel({ questions }: PostingQuestionPanelProps) {
  return (
    <div className="flex flex-col gap-gap-l">
      <SectionHeader title={`지원 문항 ${questions.length}개`} />
      <ol className="flex flex-col overflow-hidden rounded-l border border-neutral-muted bg-layer-default">
        {questions.map(({ id, title, guide, isOptional }, index) => (
          <li
            key={id}
            className="flex items-start gap-gap-m border-b border-neutral-subtle p-padding-l last:border-b-0"
          >
            {/* ol 번호와 중복 읽기 방지 */}
            <span
              aria-hidden
              className="flex h-6 w-8 shrink-0 items-center justify-center rounded-s bg-brand-weak text-label2 font-semibold text-brand"
            >
              Q{index + 1}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-gap-xs">
              <p className="flex items-center gap-gap-s">
                <span className="min-w-0 text-body2 font-medium break-words break-keep text-neutral">
                  {title}
                </span>
                {isOptional && (
                  <Badge tone="neutral" variant="weak" className="shrink-0">
                    선택
                  </Badge>
                )}
              </p>
              {guide && <p className="text-caption1 font-medium text-neutral-subtle">{guide}</p>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

export { PostingQuestionPanel }
