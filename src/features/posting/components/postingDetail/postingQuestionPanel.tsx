'use client'

import { useState } from 'react'
import { Chip } from '@/components/ui/Chip/chip'
import type { PostingPosition, PostingQuestion } from '@/features/posting/types'
import { cn } from '@/lib/utils'

type PostingQuestionPanelProps = {
  // 비어 있으면 포지션 없는 모집, questions를 바로 표시
  positions: readonly PostingPosition[]
  questions: readonly PostingQuestion[]
}

// 포지션 없는 모집은 목록 하나로 같은 마크업 사용
const ALL_QUESTIONS_ID = 'all'

function PostingQuestionPanel({ positions, questions }: PostingQuestionPanelProps) {
  const hasPositions = positions.length > 0
  const [selectedId, setSelectedId] = useState(positions[0]?.id ?? ALL_QUESTIONS_ID)
  const questionLists = hasPositions
    ? positions.map(({ id, name, questions: positionQuestions }) => ({
        id,
        label: `${name} 지원 문항`,
        questions: positionQuestions,
      }))
    : [{ id: ALL_QUESTIONS_ID, label: '지원 문항', questions }]

  return (
    <div className="flex flex-col gap-gap-s">
      {hasPositions && (
        <div role="group" aria-label="포지션" className="flex flex-wrap gap-gap-s">
          {positions.map(({ id, name }) => (
            <Chip key={id} pressed={id === selectedId} onPressedChange={() => setSelectedId(id)}>
              {name}
            </Chip>
          ))}
        </div>
      )}

      {/* 포지션을 바꿔도 높이가 같도록 모든 목록을 한 칸에 겹쳐 가장 긴 목록 높이 유지 */}
      <div className="grid">
        {questionLists.map((list) => (
          <ol
            key={list.id}
            aria-label={list.label}
            className={cn('col-start-1 row-start-1', list.id !== selectedId && 'invisible')}
          >
            {list.questions.map(({ id, title }, index) => (
              <li key={id} className="flex items-start gap-gap-m py-padding-s">
                <span
                  aria-hidden
                  className="flex h-6 w-8 shrink-0 items-center justify-center rounded-s bg-brand-weak text-label2 font-semibold text-brand"
                >
                  Q{index + 1}
                </span>
                <p className="min-w-0 flex-1 text-body2 font-medium break-words break-keep text-neutral">
                  {title}
                </p>
              </li>
            ))}
          </ol>
        ))}
      </div>
    </div>
  )
}

export { PostingQuestionPanel }
