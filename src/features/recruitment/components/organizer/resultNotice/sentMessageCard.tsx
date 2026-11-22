'use client'

import { Collapsible } from 'radix-ui'
import { useState } from 'react'
import ChevronDownIcon from '@/assets/icons/chevronDown.svg'
import MailIcon from '@/assets/icons/mail.svg'
import { Button } from '@/components/ui/Button/button'
import type {
  ResultNoticeMessage,
  ResultNoticeTarget,
  ResultNoticeVariableValues,
} from '@/features/recruitment/types'
import { cn } from '@/lib/utils'
import { MessagePreview } from './messagePreview'

const ICON_TILE_CLASS = {
  pass: 'bg-brand-weak text-brand',
  fail: 'bg-neutral-weak text-neutral-subtle',
} satisfies Record<ResultNoticeTarget, string>

type SentMessageCardProps = {
  title: string
  target: ResultNoticeTarget
  organizationName: string
  message: ResultNoticeMessage
  variableValues: ResultNoticeVariableValues
}

function SentMessageCard({
  title,
  target,
  organizationName,
  message,
  variableValues,
}: SentMessageCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Collapsible.Root
      open={isExpanded}
      onOpenChange={setIsExpanded}
      data-slot="sent-message-card"
      className="flex flex-col rounded-l border border-neutral-subtle bg-layer-default"
    >
      <div className="flex items-center gap-gap-m px-padding-xl py-padding-l">
        <span className={cn('flex shrink-0 rounded-m p-padding-xs', ICON_TILE_CLASS[target])}>
          <MailIcon aria-hidden className="size-5" />
        </span>
        <p className="min-w-0 flex-1 truncate text-headline1 font-semibold text-neutral">{title}</p>
        <Collapsible.Trigger asChild>
          <Button variant="secondary" size="s">
            {isExpanded ? '접기' : '발송한 메시지 보기'}
            <ChevronDownIcon
              aria-hidden
              className={cn('motion-safe:transition-transform', isExpanded && 'rotate-180')}
            />
          </Button>
        </Collapsible.Trigger>
      </div>

      {/* TODO: 펼침 모션 값 디자이너 확인 필요 */}
      <Collapsible.Content className="overflow-hidden motion-safe:data-[state=closed]:animate-collapsible-up motion-safe:data-[state=open]:animate-collapsible-down">
        <div className="px-padding-xl pb-padding-xl">
          <MessagePreview
            mailPreviewLabel={`${title} 미리보기`}
            organizationName={organizationName}
            message={message}
            variableValues={variableValues}
            // Figma 고정 높이(403px), 본문이 길면 메일 영역만 스크롤
            className="h-100.75"
          />
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

export { SentMessageCard }
