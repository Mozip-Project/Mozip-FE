import { Gnb } from '@/components/ui/Gnb/gnb'
import type { GnbNavItem } from '@/components/ui/Gnb/gnbNav'

const NAV_ITEMS = [
  { label: '전체 공고', href: '/postings' },
  { label: '단체 둘러보기', href: '/organizations' },
] satisfies GnbNavItem[]

export default function HomePage() {
  return (
    <>
      {/* TODO: 로그인·회원가입 화면 연결, 현재는 지원자 화면으로 바로 이동 */}
      <Gnb type="loggedOut" navItems={NAV_ITEMS} loginHref="/postings" signupHref="/postings" />
      <main className="px-page-padding pt-12 pb-20">
        <div className="mx-auto w-full max-w-page">
          <h1 className="text-3xl font-bold">MOZIP.</h1>
        </div>
      </main>
    </>
  )
}
