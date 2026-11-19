import { SidebarLayout } from '@/components/ui/Sidebar/sidebarLayout'
import { RecruitmentNav } from '@/features/recruitment/components/recruitmentNav/recruitmentNav'

export default function PostingsLayout({ children }: LayoutProps<'/manage/postings'>) {
  return <SidebarLayout sidebar={<RecruitmentNav />}>{children}</SidebarLayout>
}
