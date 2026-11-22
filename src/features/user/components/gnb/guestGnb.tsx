import Link from 'next/link'
import { Button } from '@/components/ui/Button/button'
import { Gnb } from '@/components/ui/Gnb/gnb'

function GuestGnb() {
  return (
    <>
      {/* TODO: 로그인·회원가입 화면 연결 */}
      <Gnb
        actions={
          <>
            <Button asChild variant="tertiary" size="m">
              <Link href="/">로그인</Link>
            </Button>
            <Button asChild variant="primary" size="m">
              <Link href="/">회원가입</Link>
            </Button>
          </>
        }
      />
    </>
  )
}

export { GuestGnb }
