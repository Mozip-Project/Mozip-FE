import { redirect } from 'next/navigation'
import { getFirstPublishedPostingId } from '@/features/posting/api/organizer'
import { getPostingManageDetailPath } from '@/features/recruitment/utils/recruitmentRoutes'

// 첫 진행 중 공고 상세로 이동, 없으면 공고 목록이 있는 운영진 홈으로 이동
export default async function PostingManagePage() {
  const postingId = await getFirstPublishedPostingId()

  redirect(postingId ? getPostingManageDetailPath(postingId) : '/manage')
}
