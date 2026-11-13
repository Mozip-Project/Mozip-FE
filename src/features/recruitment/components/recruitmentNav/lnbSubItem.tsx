'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { Suspense } from 'react'
import { ARIA_CURRENT } from '@/components/ui/ActiveLink/activeLink'
import {
  getDocumentResultPath,
  getDocumentReviewPath,
  getPostingCreatePath,
  getPostingManagePath,
} from '@/features/recruitment/utils/recruitmentRoutes'
import { cn } from '@/lib/utils'
import { getClosestActivePath } from '@/utils/activePath'

const ITEM_CLASS = cn(
  'flex h-11 items-center rounded-m pr-padding-s pl-10 text-label1 font-medium text-neutral-muted',
  'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
  'aria-[current]:bg-neutral-weak aria-[current]:font-semibold aria-[current]:text-neutral',
)

// 서버 렌더링 메뉴에서도 쓰도록 함수 대신 키로 전달
const LNB_SUB_ITEM_PATH = {
  postings: getPostingManagePath,
  'postings/new': getPostingCreatePath,
  documents: getDocumentReviewPath,
  'documents/summary': getDocumentResultPath,
}

type LnbSubItemProps = {
  label: string
  path: keyof typeof LNB_SUB_ITEM_PATH
}

// 동적 경로는 prerender 시 모집 ID를 몰라 링크 없는 항목을 먼저 렌더링
function LnbSubItem(props: LnbSubItemProps) {
  return (
    <Suspense fallback={<div className={ITEM_CLASS}>{props.label}</div>}>
      <LnbSubItemLink {...props} />
    </Suspense>
  )
}

function LnbSubItemLink({ label, path }: LnbSubItemProps) {
  const { recruitmentId } = useParams<{ recruitmentId: string }>()
  const pathname = usePathname()
  const href = LNB_SUB_ITEM_PATH[path](recruitmentId)
  // 상세 화면에서도 상위 메뉴 표시, 여러 항목이 겹치면 가장 긴 경로만 선택
  const current = getClosestActivePath(
    pathname,
    Object.values(LNB_SUB_ITEM_PATH).map((getPath) => getPath(recruitmentId)),
  )

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
