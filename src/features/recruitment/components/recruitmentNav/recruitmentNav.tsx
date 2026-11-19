'use client'

import { useParams } from 'next/navigation'
import { Suspense } from 'react'
import { useDocumentResultOverview } from '@/features/recruitment/hooks/useDocumentResults'
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
  const isHydrated = useIsHydrated()

  // 공유 layout은 서버에서 공고 ID가 있는 화면 기준으로 그려져 hydration 후 실제 경로 반영
  if (!isHydrated) {
    return UNRESOLVED_NAV
  }
  if (!postingId) {
    return <RecruitmentNavView overview={null} isPostingSelected={false} />
  }
  return <RecruitmentNavWithOverview postingId={postingId} />
}

function RecruitmentNavWithOverview({ postingId }: { postingId: string }) {
  const overview = useDocumentResultOverview(postingId)

  return <RecruitmentNavView overview={overview ?? null} />
}

export { RecruitmentNav }
