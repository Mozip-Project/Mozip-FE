import { SidebarLayout } from '@/components/ui/Sidebar/sidebarLayout'
import { RecruitmentNav } from '@/features/recruitment/components/recruitmentNav/recruitmentNav'

export default function RecruitmentLayout({
  children,
}: LayoutProps<'/manage/recruitments/[recruitmentId]'>) {
  return <SidebarLayout sidebar={<RecruitmentNav />}>{children}</SidebarLayout>
}
