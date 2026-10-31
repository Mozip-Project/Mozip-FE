import { Gnb } from '@/components/ui/Gnb/gnb'
import type { GnbNavItem } from '@/components/ui/Gnb/gnbNav'

const NAV_ITEMS = [
  { label: '전체 공고', href: '/manage/postings' },
  { label: '단체 관리', href: '/manage/organization' },
  { label: '모집 관리', href: '/manage/recruitments' },
] satisfies GnbNavItem[]

export default function ManageLayout({ children }: LayoutProps<'/manage'>) {
  return (
    <>
      {/* TODO: 로그인 사용자·단체 정보 연결 */}
      <Gnb
        type="organizer"
        homeHref="/manage"
        navItems={NAV_ITEMS}
        organizationName="UXUX"
        userName="김모집"
        myPageHref="/mypage"
        switchModeHref="/postings"
        logoutHref="/"
      />
      <div className="px-page-padding pt-12 pb-20">
        <div className="mx-auto w-full max-w-page">{children}</div>
      </div>
    </>
  )
}
