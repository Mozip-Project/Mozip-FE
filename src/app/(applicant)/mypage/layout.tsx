import { SidebarLayout } from '@/components/ui/Sidebar/sidebarLayout'
import { MyPageNav } from '@/features/mypage/components/myPageNav'

export default function MyPageLayout({ children }: LayoutProps<'/mypage'>) {
  return <SidebarLayout sidebar={<MyPageNav mode="applicant" />}>{children}</SidebarLayout>
}
