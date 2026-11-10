'use client'

import { Sidebar, type SidebarItem } from '@/components/ui/Sidebar/sidebar'
import { useToast } from '@/providers/toastProvider'

const UPCOMING_MENU_LABELS = ['팀 설정', '대표자 변경', '이용권 결제'] as const

function OrganizationNav() {
  const { showToast } = useToast()

  // TODO: 하위 페이지 구현 시 해당 메뉴를 링크로 전환
  const items: SidebarItem[] = [
    { label: '단체 프로필', href: '/manage/organization' },
    { label: '운영진 관리', href: '/manage/organization/members' },
    ...UPCOMING_MENU_LABELS.map((label) => ({
      label,
      onSelect: () => showToast({ title: '준비 중인 기능이에요', icon: 'alert' }),
    })),
  ]

  return <Sidebar title="단체 관리" items={items} />
}

export { OrganizationNav }
