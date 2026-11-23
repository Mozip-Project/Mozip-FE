import { getSavedOrganizationId } from '@/features/organization/server/currentOrganizationCookie'
import { PostingManageDetailContent } from './postingManageDetailContent'

type CurrentPostingManageDetailProps = Pick<PageProps<'/manage/postings/[postingId]'>, 'params'>

// 쿠키는 요청 시점 값이라 호출부에서 Suspense로 감싸야 함(cacheComponents)
async function CurrentPostingManageDetail({ params }: CurrentPostingManageDetailProps) {
  const [{ postingId }, savedOrganizationId] = await Promise.all([params, getSavedOrganizationId()])
  return (
    <PostingManageDetailContent postingId={postingId} savedOrganizationId={savedOrganizationId} />
  )
}

export { CurrentPostingManageDetail }
