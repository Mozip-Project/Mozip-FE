import { Gnb } from '@/components/ui/Gnb/gnb'
import type { GnbNavItem } from '@/components/ui/Gnb/gnbNav'
import { OrganizationSelector } from '@/components/ui/Gnb/organizationSelector'
import { ProfileMenu } from '@/components/ui/Gnb/profileMenu'
import { NotificationPanel } from '@/features/notification/components/notificationPanel/notificationPanel'
import { NOTIFICATION_SAMPLE } from '@/features/notification/mocks/notificationSample'
import { MY_ORGANIZATIONS_SAMPLE } from '@/features/organization/mocks/myOrganizationsSample'
import { ToastProvider } from '@/providers/toastProvider'

const NAV_ITEMS = [
  { label: '단체 관리', href: '/manage/organization' },
  { label: '모집 관리', href: '/manage/recruitments' },
] satisfies GnbNavItem[]

export default function ManageLayout({ children }: LayoutProps<'/manage'>) {
  return (
    <ToastProvider>
      {/* TODO: 로그인 사용자·단체 정보, 알림 목록 연결 */}
      <Gnb
        homeHref="/manage"
        navItems={NAV_ITEMS}
        actions={
          <>
            <OrganizationSelector
              organizations={MY_ORGANIZATIONS_SAMPLE.organizations}
              currentOrganizationId={MY_ORGANIZATIONS_SAMPLE.currentOrganizationId}
            />
            <NotificationPanel
              notifications={NOTIFICATION_SAMPLE}
              settingsHref="/manage/mypage/notifications"
            />
            <ProfileMenu
              name="김모집"
              mode="organizer"
              myPageHref="/manage/mypage"
              switchModeHref="/postings"
              logoutHref="/"
            />
          </>
        }
      />
      <div className="px-page-padding pt-12 pb-20">
        <div className="mx-auto w-full max-w-page">{children}</div>
      </div>
    </ToastProvider>
  )
}
