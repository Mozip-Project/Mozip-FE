import ArrowRightIcon from '@/assets/icons/arrowRight.svg'
import DownloadIcon from '@/assets/icons/download.svg'
import FileIcon from '@/assets/icons/file.svg'
import LinkIcon from '@/assets/icons/link.svg'
import { cn } from '@/lib/utils'

type AttachmentType = 'file' | 'link'

const TYPE_CONTENT = {
  file: { Icon: FileIcon, ActionIcon: DownloadIcon, actionLabel: '다운로드' },
  link: { Icon: LinkIcon, ActionIcon: ArrowRightIcon, actionLabel: '새 탭에서 열기' },
} satisfies Record<AttachmentType, object>

type AttachmentItemProps = {
  type: AttachmentType
  name: string
  meta: string
  href: string
  className?: string
}

function AttachmentItem({ type, name, meta, href, className }: AttachmentItemProps) {
  const { Icon, ActionIcon, actionLabel } = TYPE_CONTENT[type]
  const isLink = type === 'link'

  return (
    <a
      href={href}
      download={isLink ? undefined : name}
      target={isLink ? '_blank' : undefined}
      rel={isLink ? 'noopener noreferrer' : undefined}
      data-slot="attachment-item"
      className={cn(
        'group inline-flex max-w-full items-center gap-gap-l rounded-m bg-neutral-weak px-padding-s py-padding-xs',
        'transition-colors hover:bg-neutral-weak-pressed motion-reduce:transition-none',
        'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
        className,
      )}
    >
      <Icon aria-hidden className="size-5 shrink-0 text-neutral-muted" />
      {/* {' '}: 이름·정보·동작이 붙어 읽히지 않도록 단어 구분 */}
      <span className="flex min-w-0 flex-col">
        {/* 말줄임된 이름 전체를 hover로 확인 */}
        <span title={name} className="max-w-35 truncate text-label1 font-semibold text-neutral">
          {name}
        </span>{' '}
        <span className="text-caption1 font-medium whitespace-nowrap text-neutral-subtle">
          {meta}
        </span>
      </span>{' '}
      <span className="sr-only">{actionLabel}</span>
      <ActionIcon
        aria-hidden
        className="size-4 shrink-0 text-neutral-subtle transition-colors group-hover:text-neutral motion-reduce:transition-none"
      />
    </a>
  )
}

export { AttachmentItem }
