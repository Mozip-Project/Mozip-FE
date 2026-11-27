import { Suspense } from 'react'
import { Gnb } from '@/components/ui/Gnb/gnb'
import type { GnbNavItem } from '@/components/ui/Gnb/gnbNav'
import { NotificationPanel } from '@/features/notification/components/notificationPanel/notificationPanel'
import { CurrentOrganizationSwitcher } from '@/features/organization/components/organizationSwitcher/currentOrganizationSwitcher'
import { MyProfileMenu } from './myProfileMenu'

const NAV_ITEMS = [
  { label: '단체 관리', href: '/manage/organization' },
  { label: '모집 관리', href: '/manage/postings' },
] satisfies GnbNavItem[]

function OrganizerGnb() {
  return (
    <Gnb
      homeHref="/manage"
      navItems={NAV_ITEMS}
      actions={
        <>
          <Suspense fallback={null}>
            <CurrentOrganizationSwitcher />
          </Suspense>
          <NotificationPanel settingsHref="/manage/mypage/notifications" />
          <MyProfileMenu mode="organizer" myPageHref="/manage/mypage" switchModeHref="/" />
        </>
      }
    />
  )
}

export { OrganizerGnb }
