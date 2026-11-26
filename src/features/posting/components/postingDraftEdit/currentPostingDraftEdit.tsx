import { getSavedOrganizationId } from '@/features/organization/server/currentOrganizationCookie'
import { PostingDraftEditContent } from './postingDraftEditContent'

type CurrentPostingDraftEditProps = Pick<PageProps<'/manage/postings/[postingId]/edit'>, 'params'>

// 쿠키는 요청 시점 값이라 호출부에서 Suspense로 감싸야 함(cacheComponents)
async function CurrentPostingDraftEdit({ params }: CurrentPostingDraftEditProps) {
  const [{ postingId }, savedOrganizationId] = await Promise.all([params, getSavedOrganizationId()])
  return <PostingDraftEditContent postingId={postingId} savedOrganizationId={savedOrganizationId} />
}

export { CurrentPostingDraftEdit }
