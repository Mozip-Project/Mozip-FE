import { BackLink } from '@/components/ui/BackLink/backLink'
import { cn } from '@/lib/utils'
import type { ComponentProps, ReactNode } from 'react'

type BackLinkProps = ComponentProps<typeof BackLink>

type PageHeaderProps = {
  backLink?: BackLinkProps
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

function PageHeader({ backLink, title, description, actions, className }: PageHeaderProps) {
  return (
    <header className={cn('flex flex-col items-start justify-center gap-gap-xl', className)}>
      {backLink && <BackLink {...backLink} />}

      {/* Figma 미정의인 모바일은 버튼 잘림 방지용 세로 배치 */}
      <div className="flex w-full flex-col items-start gap-gap-xl tablet:flex-row tablet:items-center">
        <div className="flex w-full min-w-0 flex-col gap-gap-xs break-words break-keep tablet:flex-1">
          <h1 className="text-title3 font-bold text-neutral">{title}</h1>
          {description && <p className="text-body2 text-neutral-muted">{description}</p>}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-gap-xl">{actions}</div>
        )}
      </div>
    </header>
  )
}

export { PageHeader }
