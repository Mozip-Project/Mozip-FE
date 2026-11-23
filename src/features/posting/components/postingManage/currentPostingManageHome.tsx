import { getSavedOrganizationId } from '@/features/organization/server/currentOrganizationCookie'
import { PostingManageHomeContent } from './postingManageHomeContent'

// 쿠키는 요청 시점 값이라 호출부에서 Suspense로 감싸야 함(cacheComponents)
async function CurrentPostingManageHome() {
  const savedOrganizationId = await getSavedOrganizationId()
  return <PostingManageHomeContent savedOrganizationId={savedOrganizationId} />
}

export { CurrentPostingManageHome }
