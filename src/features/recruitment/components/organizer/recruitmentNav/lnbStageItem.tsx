'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { Suspense, useId, useState, type ReactNode } from 'react'
import ChevronDownIcon from '@/assets/icons/chevronDown.svg'
import { ARIA_CURRENT } from '@/components/ui/ActiveLink/activeLink'
import { getApplicantManagementPath } from '@/features/recruitment/utils/recruitmentRoutes'
import { cn } from '@/lib/utils'
import { getActivePathMatch } from '@/utils/activePath'

const ITEM_CLASS =
  'flex h-13 items-center gap-gap-s rounded-m px-padding-s py-padding-xs text-body1 font-medium text-neutral-muted'
const ACTIVE_CLASS = 'font-semibold text-neutral'

const DISABLED_CLASS = 'text-disabled'

type LnbStageItemContentProps = {
  icon: ReactNode
  label: string
  statusLabel?: string
  isStatusHighlighted?: boolean
  // 하위 메뉴가 없는 단계는 생략해 chevron 제외
  isExpanded?: boolean
  isDisabled?: boolean
}

type LnbStageItemProps = LnbStageItemContentProps & {
  isActive?: boolean
}

function LnbStageItem({ isActive = false, ...contentProps }: LnbStageItemProps) {
  return (
    <div
      aria-disabled={contentProps.isDisabled || undefined}
      className={cn(
        ITEM_CLASS,
        isActive && ACTIVE_CLASS,
        contentProps.isDisabled && DISABLED_CLASS,
      )}
    >
      <LnbStageItemContent {...contentProps} />
    </div>
  )
}

// 공고별 화면으로 이동하는 단계 메뉴, 공고 ID가 없으면 링크 없이 표시
const POSTING_STAGE_PATH = {
  applicants: getApplicantManagementPath,
}

type LnbStageLinkProps = LnbStageItemContentProps & {
  path: keyof typeof POSTING_STAGE_PATH
}

// 동적 경로는 prerender 시 공고 ID를 몰라 링크 없는 항목을 먼저 렌더링
function LnbStageLink(props: LnbStageLinkProps) {
  return (
    <Suspense fallback={<LnbStageItem {...props} />}>
      <PostingStageLink {...props} />
    </Suspense>
  )
}

function PostingStageLink({ path, ...contentProps }: LnbStageLinkProps) {
  const { postingId } = useParams<{ postingId?: string }>()
  const pathname = usePathname()

  // TODO: 공고 선택 전 메뉴 표시 방식 디자인 확정 후 교체
  if (!postingId || contentProps.isDisabled) {
    return <LnbStageItem {...contentProps} isDisabled />
  }

  const href = POSTING_STAGE_PATH[path](postingId)
  const match = getActivePathMatch(pathname, href)

  return (
    <Link
      href={href}
      aria-current={match && ARIA_CURRENT[match]}
      className={cn(
        ITEM_CLASS,
        'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
        'aria-[current]:font-semibold aria-[current]:text-neutral',
      )}
    >
      <LnbStageItemContent {...contentProps} />
    </Link>
  )
}

type LnbStageGroupProps = Omit<LnbStageItemContentProps, 'isExpanded' | 'isDisabled'> & {
  isCurrent: boolean
  children: ReactNode
}

function LnbStageGroup({ isCurrent, children, ...contentProps }: LnbStageGroupProps) {
  const listId = useId()
  const [isExpanded, setIsExpanded] = useState(isCurrent)
  const [wasCurrent, setWasCurrent] = useState(isCurrent)

  // 다른 경로로 이 단계 화면에 들어오면 다시 펼침
  if (isCurrent !== wasCurrent) {
    setWasCurrent(isCurrent)
    if (isCurrent) {
      setIsExpanded(true)
    }
  }

  return (
    <>
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={listId}
        onClick={() => setIsExpanded((previous) => !previous)}
        className={cn(
          ITEM_CLASS,
          'w-full cursor-pointer text-left',
          'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
          isCurrent && ACTIVE_CLASS,
        )}
      >
        <LnbStageItemContent {...contentProps} isExpanded={isExpanded} />
      </button>
      <ul id={listId} hidden={!isExpanded} className="mt-gap-xxs flex flex-col gap-gap-xxs">
        {children}
      </ul>
    </>
  )
}

function LnbStageItemContent({
  icon,
  label,
  statusLabel,
  isStatusHighlighted = false,
  isExpanded,
  isDisabled = false,
}: LnbStageItemContentProps) {
  return (
    <>
      <span className="size-5 shrink-0 [&_svg]:size-full">{icon}</span>
      <span className="min-w-0 flex-1">{label}</span>
      {statusLabel && (
        <span
          className={cn(
            'shrink-0 text-label1 font-normal',
            isStatusHighlighted ? 'text-brand' : 'text-placeholder',
            isDisabled && DISABLED_CLASS,
          )}
        >
          {statusLabel}
        </span>
      )}
      {isExpanded !== undefined && (
        <ChevronDownIcon
          aria-hidden
          className={cn('size-4 shrink-0', isExpanded && 'rotate-180')}
        />
      )}
    </>
  )
}

export { LnbStageGroup, LnbStageItem, LnbStageLink }
