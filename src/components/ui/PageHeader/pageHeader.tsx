import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    // Figma 미정의인 모바일은 버튼 잘림 방지용 세로 배치
    <header
      className={cn(
        'flex flex-col items-start gap-gap-xl tablet:flex-row tablet:items-center',
        className,
      )}
    >
      <div className="flex w-full min-w-0 flex-col gap-gap-xs break-words tablet:flex-1">
        <h1 className="text-title3 font-bold text-neutral">{title}</h1>
        {description && <p className="text-body2 text-neutral-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-gap-xl">{actions}</div>}
    </header>
  )
}

export { PageHeader }
