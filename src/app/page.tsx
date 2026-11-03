import Link from 'next/link'
import { Button } from '@/components/ui/Button/button'
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
      <Gnb
        navItems={NAV_ITEMS}
        actions={
          <>
            <Button asChild variant="tertiary" size="m">
              <Link href="/postings">로그인</Link>
            </Button>
            <Button asChild variant="primary" size="m">
              <Link href="/postings">회원가입</Link>
            </Button>
          </>
        }
      />
      <main className="px-page-padding pt-12 pb-20">
        <div className="mx-auto w-full max-w-page">
          <h1 className="text-3xl font-bold">MOZIP.</h1>
        </div>
      </main>
    </>
  )
}
