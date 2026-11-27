import { Badge } from '@/components/ui/Badge/badge'
import { ActivityTable, type Activity, type ActivityColumn } from './activityTable'
import { AnswerContent } from './answerContent'
import { FileLinkList, type FileLinkAttachment } from './fileLinkList'

type QuestionHeaderContent = {
  number: number
  title: string
  required: boolean
  description: string | null
}

type QuestionCard =
  | {
      type: 'text'
      id: string
      header: QuestionHeaderContent
      answer: string
      maxLength: number
    }
  | {
      type: 'activity'
      id: string
      header: QuestionHeaderContent
      columns: ActivityColumn[]
      activities: Activity[]
    }
  | {
      type: 'fileLink'
      id: string
      header: QuestionHeaderContent
      attachments: FileLinkAttachment[]
    }

type ApplicationAnswerCardsProps = {
  questionCards: readonly QuestionCard[]
}

// 표·첨부 목록은 비면 아무것도 안 그려 문구로 대신, 서술형은 AnswerContent가 처리
function isUnansweredListCard(card: QuestionCard) {
  return (
    (card.type === 'activity' && card.activities.length === 0) ||
    (card.type === 'fileLink' && card.attachments.length === 0)
  )
}

// 지원서 문항·답변 카드, 운영진 서류 평가와 지원자의 제출한 지원서가 함께 사용
function ApplicationAnswerCards({ questionCards }: ApplicationAnswerCardsProps) {
  return (
    <>
      {questionCards.map((card) => (
        <section
          key={card.id}
          className="flex min-w-70 flex-col gap-gap-l rounded-l border border-neutral-muted bg-layer-default p-padding-xl"
        >
          <div className="flex flex-col items-start gap-gap-s break-words">
            <Badge tone="brand" variant="weak">
              Q{card.header.number}
            </Badge>
            <h3 className="text-body1 font-semibold text-neutral">
              {card.header.title}
              {card.header.required && (
                <>
                  <span aria-hidden className="ml-gap-xs align-top text-label1 text-critical">
                    *
                  </span>
                  <span className="sr-only">필수</span>
                </>
              )}
            </h3>
            {card.header.description && (
              <p className="text-label2 font-normal text-neutral-subtle">
                {card.header.description}
              </p>
            )}
          </div>
          <hr className="border-neutral-subtle" />
          {card.type === 'text' && (
            <AnswerContent answer={card.answer} maxLength={card.maxLength} />
          )}
          {card.type === 'activity' && (
            <ActivityTable columns={card.columns} activities={card.activities} />
          )}
          {card.type === 'fileLink' && <FileLinkList attachments={card.attachments} />}
          {isUnansweredListCard(card) && (
            <p className="text-body2 text-placeholder">답변하지 않은 문항이에요</p>
          )}
        </section>
      ))}
    </>
  )
}

export { ApplicationAnswerCards }
export type { QuestionCard }
