import { Gnb } from '@/components/ui/Gnb/gnb'
import type { GnbNavItem } from '@/components/ui/Gnb/gnbNav'
import { ProfileMenu } from '@/components/ui/Gnb/profileMenu'
import { NotificationPanel } from '@/features/notification/components/notificationPanel'

const NAV_ITEMS = [
  { label: '전체 공고', href: '/postings' },
  { label: '내 지원', href: '/applications' },
] satisfies GnbNavItem[]

export default function ApplicantLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      {/* TODO: 로그인 사용자 정보, 알림 목록 연결 */}
      <Gnb
        homeHref="/postings"
        navItems={NAV_ITEMS}
        actions={
          <>
            <NotificationPanel notifications={[]} settingsHref="/mypage" />
            <ProfileMenu
              name="김모집"
              mode="applicant"
              myPageHref="/mypage"
              switchModeHref="/manage"
              logoutHref="/"
            />
          </>
        }
      />
      <div className="px-page-padding pt-12 pb-20">
        <div className="mx-auto w-full max-w-page">{children}</div>
      </div>
    </>
  )
}
