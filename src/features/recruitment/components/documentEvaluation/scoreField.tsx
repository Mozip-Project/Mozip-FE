import { ScoreRow } from '@/components/ui/ScoreRow/scoreRow'

type ScoreQuestion = {
  id: string
  label: string
}

type ScoreFieldProps = {
  questions: readonly ScoreQuestion[]
  scores: Partial<Record<string, string>>
  onScoreChange: (questionId: string, score: string) => void
  disabled?: boolean
}

function ScoreField({ questions, scores, onScoreChange, disabled }: ScoreFieldProps) {
  return (
    <div className="flex min-w-70 flex-col gap-gap-m">
      <p className="truncate text-label1 font-semibold text-neutral-muted">문항별 점수</p>
      {questions.map((question, index) => (
        <ScoreRow
          key={question.id}
          label={`Q${index + 1}. ${question.label}`}
          // 빈 문자열로 미선택 controlled 상태 유지
          value={scores[question.id] ?? ''}
          onValueChange={(score) => onScoreChange(question.id, score)}
          disabled={disabled}
        />
      ))}
    </div>
  )
}

export { ScoreField }
export type { ScoreQuestion }
