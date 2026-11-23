import { Suspense } from 'react'
import { Gnb } from '@/components/ui/Gnb/gnb'
import type { GnbNavItem } from '@/components/ui/Gnb/gnbNav'
import { ProfileMenu } from '@/components/ui/Gnb/profileMenu'
import { NotificationPanel } from '@/features/notification/components/notificationPanel/notificationPanel'
import { CurrentOrganizationSwitcher } from '@/features/organization/components/organizationSwitcher/currentOrganizationSwitcher'
import { ToastProvider } from '@/providers/toastProvider'

const NAV_ITEMS = [
  { label: '단체 관리', href: '/manage/organization' },
  { label: '모집 관리', href: '/manage/postings' },
] satisfies GnbNavItem[]

export default function ManageLayout({ children }: LayoutProps<'/manage'>) {
  return (
    <ToastProvider>
      {/* TODO: 로그인 사용자 정보 연결 */}
      <Gnb
        homeHref="/manage"
        navItems={NAV_ITEMS}
        actions={
          <>
            <Suspense fallback={null}>
              <CurrentOrganizationSwitcher />
            </Suspense>
            <NotificationPanel settingsHref="/manage/mypage/notifications" />
            <ProfileMenu
              name="김모집"
              mode="organizer"
              myPageHref="/manage/mypage"
              switchModeHref="/"
              logoutHref="/"
            />
          </>
        }
      />
      <div className="px-page-padding pt-(--page-padding-top) pb-(--page-padding-bottom)">
        <div className="mx-auto w-full max-w-page">{children}</div>
      </div>
    </ToastProvider>
  )
}
