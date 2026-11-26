import ChevronRightIcon from '@/assets/icons/chevronRight.svg'
import { Badge } from '@/components/ui/Badge/badge'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

// button의 name 속성과 겹쳐 제외
type RecruitSwitcherProps = Omit<ComponentProps<'button'>, 'children' | 'name'> & {
  // null은 조회 중
  name: string | null
  ddayLabel?: string | null
}

// 팝업이 열리면 Radix가 data-state=open 지정
function RecruitSwitcher({ name, ddayLabel, className, ...props }: RecruitSwitcherProps) {
  return (
    <button
      type="button"
      data-slot="recruit-switcher"
      className={cn(
        'group flex w-full cursor-pointer flex-col gap-gap-s rounded-l border border-neutral-weak bg-layer-default p-padding-m text-left',
        'hover:bg-layer-default-pressed disabled:cursor-default disabled:hover:bg-layer-default data-[state=open]:border-brand-solid',
        'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
        className,
      )}
      {...props}
    >
      {ddayLabel && (
        <Badge tone="brand" variant="weak" className="self-start">
          {ddayLabel}
        </Badge>
      )}
      <span className="flex w-full items-center gap-gap-xs text-neutral">
        <span className="sr-only">모집 선택, 현재 모집: </span>
        {name === null ? (
          // 조회 후 카드 높이 변화 방지
          <span className="flex h-5.5 min-w-0 flex-1 items-center">
            <span className="sr-only">불러오는 중</span>
            <span
              aria-hidden
              className="skeleton-bar h-4 w-4/5 animate-skeleton-delayed-show rounded-full"
            />
          </span>
        ) : (
          <span className="min-w-0 flex-1 truncate text-body2 font-bold">{name}</span>
        )}
        <ChevronRightIcon
          aria-hidden
          className="size-4 shrink-0 group-data-[state=open]:text-brand"
        />
      </span>
    </button>
  )
}

export { RecruitSwitcher }
