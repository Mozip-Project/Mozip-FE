import { Sidebar, type SidebarItem } from '@/components/ui/Sidebar/sidebar'
import { MY_PAGE_PATHS, type MyPageMode } from '@/features/mypage/utils/myPageRoutes'

type MyPageNavProps = {
  mode: MyPageMode
}

function MyPageNav({ mode }: MyPageNavProps) {
  const paths = MY_PAGE_PATHS[mode]
  const items = [
    { label: '계정 설정', href: paths.accountSettings },
    { label: '알림 설정', href: paths.notificationSettings },
  ] satisfies SidebarItem[]

  return <Sidebar title="마이페이지" items={items} />
}

export { MyPageNav }
