'use client'

import { useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import { useMeQuery } from '@/features/user/api/queries'
import { ApiError } from '@/lib/apiError'

// 명세상 재발급 없이 바로 로그인 화면으로 보내는 코드(쿠키 없음, 토큰 손상)
const LOGIN_REQUIRED_CODES = ['COMMON_401', 'AUTH_003']
// TODO: 로그인 화면이 생기면 로그인 경로로 변경
const LOGGED_OUT_HOME_PATH = '/'

type LoginRequiredProps = {
  children: ReactNode
}

// 로그인이 필요한 영역에서 me가 인증 오류면 화면 대신 로그아웃 홈으로 이동
function LoginRequired({ children }: LoginRequiredProps) {
  const router = useRouter()
  const { error } = useMeQuery()
  const isLoginRequired = error instanceof ApiError && LOGIN_REQUIRED_CODES.includes(error.code)

  useEffect(() => {
    if (isLoginRequired) {
      router.replace(LOGGED_OUT_HOME_PATH)
    }
  }, [isLoginRequired, router])

  if (isLoginRequired) {
    return null
  }
  return children
}

export { LoginRequired }
