import { Badge } from '@/components/ui/Badge/badge'
import { InlineNotice } from '@/components/ui/InlineNotice/inlineNotice'
import type { ReactNode } from 'react'

type ApplyQuestionCardProps = {
  questionNumber: number
  title: string
  description?: string
  required?: boolean
  hasDivider?: boolean
  errorMessage?: string
  children: ReactNode
}

function ApplyQuestionCard({
  questionNumber,
  title,
  description,
  required = false,
  hasDivider = true,
  errorMessage,
  children,
}: ApplyQuestionCardProps) {
  return (
    <section className="flex min-w-0 flex-col gap-gap-l rounded-l border border-neutral-subtle bg-layer-default p-padding-xl">
      <div className="flex flex-col items-start gap-gap-s">
        <Badge tone="brand" variant="weak">
          Q{questionNumber}
        </Badge>
        <div className="flex flex-col gap-gap-xxs break-words break-keep">
          <h2 className="text-body1 font-semibold text-neutral">
            {title}
            {required && (
              <>
                <span aria-hidden className="ml-1 align-top text-label1 text-critical">
                  *
                </span>
                <span className="sr-only">필수</span>
              </>
            )}
          </h2>
          {description && (
            <p className="text-label2 font-normal text-neutral-subtle">{description}</p>
          )}
        </div>
      </div>

      {hasDivider && <hr className="border-neutral-subtle" />}

      {children}

      {errorMessage && (
        <InlineNotice tone="critical" role="alert">
          {errorMessage}
        </InlineNotice>
      )}
    </section>
  )
}

export { ApplyQuestionCard }
export type { ApplyQuestionCardProps }
