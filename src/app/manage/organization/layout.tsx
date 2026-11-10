import { Sidebar, type SidebarItem } from '@/components/ui/Sidebar/sidebar'
import { SidebarLayout } from '@/components/ui/Sidebar/sidebarLayout'
import type { Route } from 'next'

// TODO: 하위 페이지 구현 시 Route 단언 제거
const SIDEBAR_ITEMS = [
  { label: '단체 프로필', href: '/manage/organization' },
  { label: '운영진 관리', href: '/manage/organization/members' as Route },
  { label: '팀 설정', href: '/manage/organization/teams' as Route },
  { label: '대표자 변경', href: '/manage/organization/owner' as Route },
  { label: '이용권 결제', href: '/manage/organization/billing' as Route },
] satisfies SidebarItem[]

export default function OrganizationLayout({ children }: LayoutProps<'/manage/organization'>) {
  return (
    <SidebarLayout sidebar={<Sidebar title="단체 관리" items={SIDEBAR_ITEMS} />}>
      {children}
    </SidebarLayout>
  )
}
