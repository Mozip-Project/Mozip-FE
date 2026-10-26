import Image from 'next/image'
import Link from 'next/link'
import BookmarkIcon from '@/assets/icons/bookmark.svg'
import BookmarkFillIcon from '@/assets/icons/bookmarkFill.svg'
import { Badge } from '@/components/ui/Badge/badge'
import type { Route } from 'next'

type JobCardProps = {
  href: Route
  title: string
  organizationType: string
  organizationName: string
  summary: string
  deadlineLabel: string
  tags: readonly string[]
  thumbnailSrc?: string
  isScrapped?: boolean
}

function JobCard({
  href,
  title,
  organizationType,
  organizationName,
  summary,
  deadlineLabel,
  tags,
  thumbnailSrc,
  isScrapped = false,
}: JobCardProps) {
  return (
    <article data-slot="job-card" className="relative flex flex-col rounded-l bg-layer-default">
      <div className="relative h-40 overflow-hidden rounded-l bg-neutral-weak">
        {thumbnailSrc && (
          <Image
            src={thumbnailSrc}
            alt=""
            fill
            sizes="(min-width: 1280px) 282px, 100vw"
            className="object-cover"
          />
        )}
        <div className="relative flex items-start justify-between p-padding-s">
          <Badge>{deadlineLabel}</Badge>
          {/* TODO: 스크랩 API 확정 후 동작 연결 */}
          <button
            type="button"
            aria-label={`${title} 스크랩`}
            aria-pressed={isScrapped}
            className="relative z-10 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-neutral-subtle bg-layer-floating text-neutral outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring [&_svg]:size-5"
          >
            {isScrapped ? <BookmarkFillIcon aria-hidden /> : <BookmarkIcon aria-hidden />}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-gap-s px-0.5 py-padding-m">
        <div className="flex flex-col gap-gap-xxs">
          <p className="flex min-w-0 items-center gap-gap-xs text-label2 text-neutral-subtle">
            <span className="shrink-0">{organizationType}</span>
            <span aria-hidden>|</span>
            <span className="truncate font-medium text-neutral-muted">{organizationName}</span>
          </p>

          <h3 className="text-headline2 font-semibold text-neutral">
            <Link
              href={href}
              className="outline-none after:absolute after:inset-0 after:rounded-l focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-focus-ring"
            >
              {title}
            </Link>
          </h3>
          <p className="text-label2 text-neutral-subtle">{summary}</p>
        </div>
        <ul className="flex flex-wrap gap-gap-xs">
          {tags.map((tag) => (
            <li key={tag}>
              <Badge tone="neutral" variant="weak">
                {tag}
              </Badge>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

export { JobCard }
