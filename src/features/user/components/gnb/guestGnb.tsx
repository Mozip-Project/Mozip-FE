'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button/button'
import { Gnb } from '@/components/ui/Gnb/gnb'
import { useMockLogin } from '@/features/user/hooks/useMockLogin'

function GuestGnb() {
  const loginAsMockUser = useMockLogin()

  return (
    <>
      {/* TODO: 로그인·회원가입 화면 연결, 로그인은 임시로 MSW me 응답만 성공으로 전환 */}
      <Gnb
        actions={
          <>
            <Button variant="tertiary" size="m" onClick={loginAsMockUser}>
              로그인
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
