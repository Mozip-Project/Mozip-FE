import { redirect } from 'next/navigation'
import { getManagedPostings } from '@/features/posting/api/organizer'
import { getPostingManageDetailPath } from '@/features/recruitment/utils/recruitmentRoutes'

// 서버 정렬 순서의 첫 진행 중 공고로 이동, 없으면 공고 목록이 있는 운영진 홈으로 이동
export default async function PostingManagePage() {
  const postings = await getManagedPostings()
  const firstPublishedPosting = postings.find((posting) => posting.status === 'published')

  if (!firstPublishedPosting) {
    redirect('/manage')
  }

  redirect(getPostingManageDetailPath(firstPublishedPosting.id))
}
