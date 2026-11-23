import { Suspense } from 'react'
import { CurrentPostingManageHome } from '@/features/posting/components/postingManage/currentPostingManageHome'
import { PostingManageHomeSkeleton } from '@/features/posting/components/postingManage/postingManageHomeSkeleton'

export default function ManageHomePage() {
  return (
    <main className="flex flex-col gap-12">
      <Suspense fallback={<PostingManageHomeSkeleton />}>
        <CurrentPostingManageHome />
      </Suspense>
    </main>
  )
}
