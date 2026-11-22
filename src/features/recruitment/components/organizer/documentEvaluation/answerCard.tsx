import { Badge } from '@/components/ui/Badge/badge'
import { getTextLength } from '@/utils/text'

type AnswerCardProps = {
  questionNumber: number
  question: string
  answer: string
  maxLength: number
}

function AnswerCard({ questionNumber, question, answer, maxLength }: AnswerCardProps) {
  return (
    <section className="flex min-w-70 flex-col gap-gap-l rounded-l border border-neutral-muted bg-layer-default p-padding-xl">
      <div className="flex flex-col items-start gap-gap-s">
        <Badge tone="brand" variant="weak">
          Q{questionNumber}
        </Badge>
        <h3 className="text-body1 font-semibold break-words text-neutral">{question}</h3>
      </div>
      <p className="border-t border-neutral-subtle pt-padding-m text-body2 break-words whitespace-pre-wrap text-neutral">
        {answer}
      </p>
      <p className="self-end text-caption1 whitespace-nowrap">
        <span className="sr-only">글자 수</span>{' '}
        <span className="font-semibold text-neutral-muted">{getTextLength(answer)}</span>
        <span className="font-medium text-disabled">/{maxLength}자</span>
      </p>
    </section>
  )
}

export { AnswerCard }
