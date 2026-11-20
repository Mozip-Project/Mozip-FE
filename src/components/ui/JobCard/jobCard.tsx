import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge/badge'
import type { Route } from 'next'

type JobCardProps = {
  href: Route
  title: string
  organizationType: string
  organizationName: string
  deadlineLabel: string
  tags: readonly string[]
  thumbnailSrc?: string
}

function JobCard({
  href,
  title,
  organizationType,
  organizationName,
  deadlineLabel,
  tags,
  thumbnailSrc,
}: JobCardProps) {
  return (
    <article
      data-slot="job-card"
      className="group/job-card relative flex flex-col rounded-xl bg-layer-default"
    >
      <div className="relative h-40 overflow-hidden rounded-l bg-neutral-weak">
        {thumbnailSrc && (
          <Image
            src={thumbnailSrc}
            alt=""
            fill
            sizes="(min-width: 1280px) 322px, 100vw"
            // 썸네일 영역 안에서만 확대, 카드 크기 유지
            className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out motion-safe:group-hover/job-card:scale-120"
          />
        )}
        <div className="relative p-padding-s">
          <Badge>{deadlineLabel}</Badge>
        </div>
      </div>

      <div className="flex flex-col gap-gap-s px-0.5 py-padding-m">
        <div className="flex flex-col gap-gap-xs">
          <p className="flex min-w-0 items-center gap-gap-xs text-label2 text-neutral-subtle">
            <span className="shrink-0">{organizationType}</span>
            <span aria-hidden>|</span>
            <span className="truncate font-medium text-neutral-muted">{organizationName}</span>
          </p>

          <h3 className="text-headline2 font-semibold text-neutral">
            <Link
              href={href}
              className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-focus-ring"
            >
              {title}
            </Link>
          </h3>
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
