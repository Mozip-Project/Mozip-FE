'use client'

import { useParams } from 'next/navigation'
import { Suspense } from 'react'
import { useDocumentResultOverview } from '@/features/recruitment/hooks/useDocumentResults'
import { RecruitmentNavView } from './recruitmentNavView'

// 동적 경로는 prerender 시 모집 ID를 몰라 조회 전 메뉴를 먼저 렌더링
function RecruitmentNav() {
  return (
    <Suspense fallback={<RecruitmentNavView overview={null} />}>
      <RecruitmentNavWithOverview />
    </Suspense>
  )
}

function RecruitmentNavWithOverview() {
  const { recruitmentId } = useParams<{ recruitmentId: string }>()
  const overview = useDocumentResultOverview(recruitmentId)

  return <RecruitmentNavView overview={overview ?? null} />
}

export { RecruitmentNav }
