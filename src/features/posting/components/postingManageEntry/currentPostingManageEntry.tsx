import { getSavedOrganizationId } from '@/features/organization/server/currentOrganizationCookie'
import { PostingManageEntryContent } from './postingManageEntryContent'

// 쿠키는 요청 시점 값이라 호출부에서 Suspense로 감싸야 함(cacheComponents)
async function CurrentPostingManageEntry() {
  const savedOrganizationId = await getSavedOrganizationId()
  return <PostingManageEntryContent savedOrganizationId={savedOrganizationId} />
}

export { CurrentPostingManageEntry }
