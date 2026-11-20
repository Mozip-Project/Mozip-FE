import { Gnb } from '@/components/ui/Gnb/gnb'
import type { GnbNavItem } from '@/components/ui/Gnb/gnbNav'
import { ProfileMenu } from '@/components/ui/Gnb/profileMenu'
import { NotificationPanel } from '@/features/notification/components/notificationPanel/notificationPanel'
import { ToastProvider } from '@/providers/toastProvider'

const NAV_ITEMS = [
  { label: '전체 공고', href: '/postings' },
  { label: '내 지원', href: '/applications' },
] satisfies GnbNavItem[]

export default function ApplicantLayout({ children }: LayoutProps<'/'>) {
  return (
    <ToastProvider>
      {/* TODO: 로그인 사용자 정보 연결 */}
      {/* TODO: 마이페이지가 임시로 운영진 영역(/manage/mypage)에만 있어 지원자도 그쪽으로 이동. 모드 저장 방식 결정 후 재검토 */}
      <Gnb
        homeHref="/postings"
        navItems={NAV_ITEMS}
        actions={
          <>
            <NotificationPanel settingsHref="/manage/mypage/notifications" />
            <ProfileMenu
              name="김모집"
              mode="applicant"
              myPageHref="/manage/mypage"
              switchModeHref="/manage"
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
