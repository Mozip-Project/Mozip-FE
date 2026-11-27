import { getTextLength } from '@/utils/text'

type AnswerContentProps = {
  answer: string
  maxLength: number
}

// 서술형 문항 카드의 답변과 글자 수
function AnswerContent({ answer, maxLength }: AnswerContentProps) {
  return (
    <>
      {answer ? (
        <p className="text-body2 break-words whitespace-pre-wrap text-neutral">{answer}</p>
      ) : (
        <p className="text-body2 text-placeholder">답변하지 않은 문항이에요</p>
      )}
      <p className="self-end text-caption1 whitespace-nowrap">
        <span className="sr-only">글자 수</span>{' '}
        <span className="font-semibold text-neutral-muted">{getTextLength(answer)}</span>
        <span className="font-medium text-disabled">/{maxLength}자</span>
      </p>
    </>
  )
}

export { AnswerContent }
