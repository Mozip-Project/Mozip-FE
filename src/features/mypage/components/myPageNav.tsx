import { Sidebar, type SidebarItem } from '@/components/ui/Sidebar/sidebar'

const MY_PAGE_NAV_ITEMS = [
  { label: '계정 설정', href: '/manage/mypage' },
  { label: '알림 설정', href: '/manage/mypage/notifications' },
] satisfies SidebarItem[]

function MyPageNav() {
  return <Sidebar title="마이페이지" items={MY_PAGE_NAV_ITEMS} />
}

export { MyPageNav }
