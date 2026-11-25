'use client'

import { useParams, usePathname } from 'next/navigation'
import { Suspense } from 'react'
import { useRecruitmentPostingQuery } from '@/features/recruitment/api/organizer/queries'
import { POSTING_CREATE_PATH } from '@/features/recruitment/utils/recruitmentRoutes'
import { useIsHydrated } from '@/hooks/useIsHydrated'
import { RecruitmentNavView } from './recruitmentNavView'

const UNRESOLVED_NAV = <RecruitmentNavView overview={null} />

// 동적 경로는 prerender 시 공고 ID를 몰라 조회 전 메뉴를 먼저 렌더링
function RecruitmentNav() {
  return (
    <Suspense fallback={UNRESOLVED_NAV}>
      <RecruitmentNavByPosting />
    </Suspense>
  )
}

// 목록·작성 화면은 공고 ID가 없어 공고 선택 전 메뉴 표시
function RecruitmentNavByPosting() {
  const { postingId } = useParams<{ postingId?: string }>()
  const pathname = usePathname()
  const isHydrated = useIsHydrated()

  // 공유 layout은 서버에서 공고 ID가 있는 화면 기준으로 그려져 hydration 후 실제 경로 반영
  if (!isHydrated) {
    return UNRESOLVED_NAV
  }
  if (!postingId) {
    return (
      <RecruitmentNavView
        overview={null}
        isPostingSelected={false}
        isCreatingPosting={pathname === POSTING_CREATE_PATH}
      />
    )
  }
  return <RecruitmentNavWithOverview postingId={postingId} />
}

// 부모가 hydration 뒤에만 그려 서버 HTML과 어긋나지 않음
function RecruitmentNavWithOverview({ postingId }: { postingId: string }) {
  const { data: posting } = useRecruitmentPostingQuery(postingId)
  const overview = posting
    ? { hasInterview: posting.hasInterview, confirmedAt: posting.docResultConfirmedAt ?? null }
    : null

  return <RecruitmentNavView overview={overview} />
}

export { RecruitmentNav }
