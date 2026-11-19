'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { Suspense } from 'react'
import { ARIA_CURRENT } from '@/components/ui/ActiveLink/activeLink'
import {
  getDocumentResultPath,
  getDocumentReviewPath,
  POSTING_CREATE_PATH,
  POSTING_MANAGE_PATH,
} from '@/features/recruitment/utils/recruitmentRoutes'
import { cn } from '@/lib/utils'
import { getClosestActivePath } from '@/utils/activePath'
import type { Route } from 'next'

const ITEM_CLASS = cn(
  'flex h-13 items-center rounded-m py-padding-xs pr-padding-s pl-10 text-headline2 font-medium text-neutral-muted',
  'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
  'aria-[current]:bg-neutral-weak aria-[current]:font-semibold aria-[current]:text-brand',
)

// 공고 ID 없이 이동 가능한 메뉴와 공고별 메뉴 구분
const POSTING_FREE_PATH: Record<'postings' | 'postings/new', Route> = {
  postings: POSTING_MANAGE_PATH,
  'postings/new': POSTING_CREATE_PATH,
}

const POSTING_PATH = {
  documents: getDocumentReviewPath,
  'documents/summary': getDocumentResultPath,
}

// 서버 렌더링 메뉴에서도 쓰도록 함수 대신 키로 전달
type LnbSubItemPath = keyof typeof POSTING_FREE_PATH | keyof typeof POSTING_PATH

function getLnbSubItemHrefs(postingId: string | undefined): Partial<Record<LnbSubItemPath, Route>> {
  if (!postingId) {
    return POSTING_FREE_PATH
  }
  return {
    ...POSTING_FREE_PATH,
    documents: POSTING_PATH.documents(postingId),
    'documents/summary': POSTING_PATH['documents/summary'](postingId),
  }
}

type LnbSubItemProps = {
  label: string
  path: LnbSubItemPath
}

// 동적 경로는 prerender 시 공고 ID를 몰라 링크 없는 항목을 먼저 렌더링
function LnbSubItem(props: LnbSubItemProps) {
  return (
    <Suspense fallback={<div className={ITEM_CLASS}>{props.label}</div>}>
      <LnbSubItemLink {...props} />
    </Suspense>
  )
}

function LnbSubItemLink({ label, path }: LnbSubItemProps) {
  const { postingId } = useParams<{ postingId?: string }>()
  const pathname = usePathname()

  const hrefs = getLnbSubItemHrefs(postingId)
  const href = hrefs[path]

  // TODO: 공고 선택 전 메뉴 표시 방식 디자인 확정 후 교체
  if (!href) {
    return (
      <span aria-disabled className={cn(ITEM_CLASS, 'text-disabled')}>
        {label}
      </span>
    )
  }

  // 상세 화면에서도 상위 메뉴 표시, 여러 항목이 겹치면 가장 긴 경로만 선택
  const current = getClosestActivePath(pathname, Object.values(hrefs))

  return (
    <Link
      href={href}
      aria-current={current?.href === href ? ARIA_CURRENT[current.match] : undefined}
      className={ITEM_CLASS}
    >
      {label}
    </Link>
  )
}

export { LnbSubItem }
