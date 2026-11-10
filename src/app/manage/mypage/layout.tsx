import { SidebarLayout } from '@/components/ui/Sidebar/sidebarLayout'
import { MyPageNav } from '@/features/mypage/components/myPageNav'

export default function MyPageLayout({ children }: LayoutProps<'/manage/mypage'>) {
  return <SidebarLayout sidebar={<MyPageNav />}>{children}</SidebarLayout>
}
