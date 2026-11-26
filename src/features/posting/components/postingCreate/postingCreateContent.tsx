import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { getSavedOrganizationId } from '@/features/organization/server/currentOrganizationCookie'
import { createDemoPostingValues } from '@/features/posting/mocks/postingCreateDemoValues'
import { EMPTY_POSTING_CREATE } from '@/features/posting/schemas/postingCreateValues'
import {
  INTERVIEW_SEARCH_PARAM,
  parseHasInterview,
} from '@/features/posting/utils/postingCreateRoute'
import { getSeoulIsoDate } from '@/utils/date'
import { PostingCreateForm } from './postingCreateForm'

type PostingCreateContentProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// 쿠키는 요청 시점 값이라 호출부에서 Suspense로 감싸야 함(cacheComponents)
async function PostingCreateContent({ searchParams }: PostingCreateContentProps) {
  const [resolvedSearchParams, savedOrganizationId] = await Promise.all([
    searchParams,
    getSavedOrganizationId(),
  ])
  const hasInterview = parseHasInterview(resolvedSearchParams[INTERVIEW_SEARCH_PARAM])

  if (hasInterview === null) {
    redirect('/manage')
  }

  return (
    <PostingCreateForm
      hasInterview={hasInterview}
      savedOrganizationId={savedOrganizationId}
      defaultValues={await getDefaultValues(hasInterview)}
    />
  )
}

// 전시회 시연용, 켜면 제목·이미지·문항 외 값을 채워 시작 (전시회 후 삭제)
async function getDefaultValues(hasInterview: boolean) {
  if (process.env.NEXT_PUBLIC_POSTING_DEMO_MODE !== 'enabled') {
    return EMPTY_POSTING_CREATE
  }
  // 모집 일정 기준일을 prerender 시점이 아닌 요청 시점으로 계산
  await connection()
  return createDemoPostingValues(hasInterview, getSeoulIsoDate(new Date()))
}

export { PostingCreateContent }
