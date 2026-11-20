'use client'

import { useId, useState, type ComponentType, type ReactNode, type SVGProps } from 'react'
import CalendarIcon from '@/assets/icons/calendar.svg'
import FileTextIcon from '@/assets/icons/fileText.svg'
import MegaphoneIcon from '@/assets/icons/megaphone.svg'
import UsersIcon from '@/assets/icons/users.svg'
import { Badge } from '@/components/ui/Badge/badge'
import { Button } from '@/components/ui/Button/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs/tabs'
import type { PostingCreateValues } from '@/features/posting/schemas/postingCreateValues'
import type { PostingQuestion } from '@/features/posting/schemas/postingFormSchema'
import type { PostingCreateStep } from '@/features/posting/utils/postingCreateSteps'
import type { ReviewRow, ScheduleItem } from '@/features/posting/utils/postingReview'
import { QUESTION_TYPE_META } from './postingQuestionTypes'

type EditableStepId = Extract<PostingCreateStep['id'], 'info' | 'schedule' | 'method' | 'form'>

type ReviewCardProps = {
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  onEdit: () => void
  children: ReactNode
}

function ReviewCard({ Icon, title, onEdit, children }: ReviewCardProps) {
  const titleId = useId()

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-gap-l rounded-l border border-neutral-subtle bg-layer-default p-padding-xl"
    >
      <div className="flex items-center gap-gap-s">
        <Icon aria-hidden className="size-5 shrink-0 text-neutral" />
        <h2 id={titleId} className="min-w-0 flex-1 text-body1 font-semibold text-neutral">
          {title}
        </h2>
        <Button variant="secondary" size="s" aria-label={`${title} 수정`} onClick={onEdit}>
          수정
        </Button>
      </div>
      {children}
    </section>
  )
}

function Divider() {
  return <hr className="border-neutral-subtle" />
}

type CardProps = { onEdit: () => void }

function PostingInfoReview({ rows, onEdit }: CardProps & { rows: ReviewRow[] }) {
  return (
    <ReviewCard Icon={MegaphoneIcon} title="공고 정보" onEdit={onEdit}>
      <Divider />
      <dl className="flex flex-col gap-gap-s">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-center gap-gap-l">
            <dt className="w-30 shrink-0 text-label1 font-semibold text-neutral-subtle">{label}</dt>
            <dd className="min-w-0 flex-1 text-body2 font-normal break-keep text-neutral">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </ReviewCard>
  )
}

function ScheduleReview({ items, onEdit }: CardProps & { items: ScheduleItem[] }) {
  return (
    <ReviewCard Icon={CalendarIcon} title="모집 일정" onEdit={onEdit}>
      <Divider />
      <ol className="flex gap-gap-s">
        {items.map(({ label, value, caption }, index) => (
          <li key={label} className="flex min-w-0 flex-1 flex-col gap-2.5">
            <div aria-hidden className="flex items-center gap-gap-s">
              <span className="size-3 shrink-0 rounded-full bg-brand-solid" />
              {index < items.length - 1 && (
                <span className="h-0.5 min-w-0 flex-1 bg-(--border-color-neutral-weak)" />
              )}
            </div>
            <div className="flex flex-col gap-0.5 pr-padding-s">
              <span className="text-label2 font-medium text-neutral-subtle">{label}</span>
              <span className="text-label1 font-semibold text-neutral">{value}</span>
              {caption && (
                <span className="text-label2 font-normal text-neutral-subtle">{caption}</span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </ReviewCard>
  )
}

function MethodReview({ positionNames, onEdit }: CardProps & { positionNames: string[] }) {
  return (
    <ReviewCard Icon={UsersIcon} title="모집 방식" onEdit={onEdit}>
      <Divider />
      {positionNames.length > 0 ? (
        <ul className="flex flex-wrap gap-gap-s">
          {positionNames.map((name, index) => (
            <li key={`${name}-${index}`} className="flex">
              <Badge tone="neutral" variant="weak">
                {name}
              </Badge>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-body2 font-normal text-neutral">통합 모집</p>
      )}
    </ReviewCard>
  )
}

type FormReviewProps = CardProps & {
  questionSets: PostingCreateValues['questionSets']
  positionNames: string[]
  hasInterview: boolean
}

function FormReview({ questionSets, positionNames, hasInterview, onEdit }: FormReviewProps) {
  const [activeSetIndex, setActiveSetIndex] = useState(0)
  const questions = questionSets[activeSetIndex]?.questions ?? []

  return (
    <ReviewCard Icon={FileTextIcon} title="지원서 양식" onEdit={onEdit}>
      {positionNames.length > 0 ? (
        <Tabs
          value={String(activeSetIndex)}
          onValueChange={(value) => setActiveSetIndex(Number(value))}
        >
          <TabsList aria-label="모집 포지션" className="border-b border-neutral-subtle">
            {positionNames.map((name, index) => (
              <TabsTrigger
                key={`${name}-${index}`}
                value={String(index)}
                count={questionSets[index]?.questions.length ?? 0}
              >
                {name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      ) : (
        <Divider />
      )}
      {hasInterview && (
        <p className="flex gap-gap-m rounded-m bg-layer-basement px-padding-m py-padding-s text-label2 text-neutral-muted">
          <span className="w-22 shrink-0 font-semibold">면접 가능 시간</span>
          <span className="font-normal">설정한 면접 시간 중 가능 시간을 받아요</span>
        </p>
      )}
      <ol className="flex flex-col divide-y divide-neutral-subtle">
        {questions.map((question, index) => (
          <QuestionRow key={question.id} index={index + 1} question={question} />
        ))}
      </ol>
    </ReviewCard>
  )
}

function QuestionRow({ index, question }: { index: number; question: PostingQuestion }) {
  return (
    <li className="flex items-start gap-gap-m py-2.5">
      <span className="shrink-0 rounded-xs bg-brand-weak px-1.5 py-0.5 text-caption1 font-semibold text-brand">
        Q{index}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="flex items-start gap-gap-xs">
          <span className="min-w-0 text-label1 font-medium break-keep text-neutral">
            {question.title}
          </span>
          {question.isRequired && (
            <span className="shrink-0 text-label2 font-semibold text-critical">
              *<span className="sr-only">필수</span>
            </span>
          )}
        </p>
        <span className="text-caption1 font-normal text-neutral-subtle">
          {QUESTION_TYPE_META[question.type].label}
        </span>
      </div>
    </li>
  )
}

export { FormReview, MethodReview, PostingInfoReview, ScheduleReview }
export type { EditableStepId }
