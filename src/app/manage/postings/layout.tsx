import { Suspense } from 'react'
import { SidebarLayout } from '@/components/ui/Sidebar/sidebarLayout'
import { CurrentRecruitmentNav } from '@/features/recruitment/components/organizer/recruitmentNav/currentRecruitmentNav'
import { RecruitmentNavPlaceholder } from '@/features/recruitment/components/organizer/recruitmentNav/recruitmentNav'

export default function PostingsLayout({ children }: LayoutProps<'/manage/postings'>) {
  return (
    <SidebarLayout
      sidebar={
        <Suspense fallback={<RecruitmentNavPlaceholder />}>
          <CurrentRecruitmentNav />
        </Suspense>
      }
    >
      {children}
    </SidebarLayout>
  )
}
