type NotificationItemProps = {
  isRead: boolean
  source: string
  title: string
  meta: string
}

export function NotificationItem({ isRead, source, title, meta }: NotificationItemProps) {
  return (
    <div className="flex min-w-60 justify-between gap-gap-m bg-layer-floating px-padding-l py-padding-m">
      <div className="flex min-w-0 flex-col gap-gap-xxs text-caption1 break-words text-neutral-subtle">
        {!isRead && <span className="sr-only">읽지 않음</span>}
        <span className={`font-medium ${isRead ? '' : 'text-brand'}`}>{source}</span>
        <span
          className={`text-body2 font-semibold ${isRead ? 'text-neutral-muted' : 'text-neutral'}`}
        >
          {title}
        </span>
        <span className="font-normal">{meta}</span>
      </div>
      {!isRead && <div className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-solid" />}
    </div>
  )
}
