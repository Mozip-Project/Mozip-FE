import { Controller, type Control } from 'react-hook-form'
import { ScoreRow } from '@/components/ui/ScoreRow/scoreRow'
import type { DocumentEvaluationValues } from '@/features/recruitment/schemas/documentEvaluationSchema'

type ScoreQuestion = {
  id: string
  label: string
}

type ScoreFieldProps = {
  questions: readonly ScoreQuestion[]
  control: Control<DocumentEvaluationValues>
  disabled?: boolean
}

// 문항마다 Controller를 두어 필수 항목 오류를 문항 단위로 표시
function ScoreField({ questions, control, disabled }: ScoreFieldProps) {
  return (
    <div className="flex min-w-70 flex-col gap-gap-m">
      <p className="truncate text-label1 font-semibold text-neutral-muted">문항별 점수</p>
      {questions.map((question, index) => (
        <Controller
          key={question.id}
          name={`scores.${question.id}`}
          control={control}
          render={({ field, fieldState }) => (
            <ScoreRow
              aria-required
              label={`Q${index + 1}. ${question.label}`}
              value={field.value ?? ''}
              onValueChange={field.onChange}
              errorMessage={fieldState.error?.message}
              disabled={disabled}
            />
          )}
        />
      ))}
    </div>
  )
}

export { ScoreField }
export type { ScoreQuestion }
