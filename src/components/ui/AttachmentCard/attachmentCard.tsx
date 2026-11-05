import { useId, type ComponentProps } from 'react'
import FileTextIcon from '@/assets/icons/fileText.svg'
import { AttachmentItem } from '@/components/ui/AttachmentItem/attachmentItem'
import { cn } from '@/lib/utils'

type Attachment = Omit<ComponentProps<typeof AttachmentItem>, 'className'>

type AttachmentCardProps = {
  title: string
  items: readonly Attachment[]
  emptyMessage: string
  className?: string
}

function AttachmentCard({ title, items, emptyMessage, className }: AttachmentCardProps) {
  const titleId = useId()
  const isEmpty = items.length === 0

  return (
    <section
      aria-labelledby={titleId}
      data-slot="attachment-card"
      className={cn(
        'flex min-w-70 flex-col gap-gap-m rounded-l border border-neutral-muted bg-layer-default p-padding-xl',
        className,
      )}
    >
      <h3 id={titleId} className="text-body1 font-bold break-words text-neutral">
        {title}
      </h3>
      {isEmpty ? (
        <p className="flex items-center gap-gap-xs rounded-m bg-neutral-weak p-padding-m text-label1 font-medium text-neutral-subtle">
          <FileTextIcon aria-hidden className="size-4 shrink-0" />
          <span className="min-w-0 break-words break-keep">{emptyMessage}</span>
        </p>
      ) : (
        // Safari VoiceOver 목록 인식용 role
        <ul role="list" className="flex flex-wrap gap-gap-s">
          {items.map((item) => (
            <li key={item.href} className="max-w-full">
              <AttachmentItem {...item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export { AttachmentCard }
export type { Attachment }
