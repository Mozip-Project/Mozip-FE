'use client'

import { useMeQuery } from '@/features/user/api/queries'
import { ApplicantGnb } from './applicantGnb'
import { GuestGnb } from './guestGnb'

// TODO: 토큰 쿠키 이름·도메인 확인 후 서버에서 판단하도록 변경
function PublicGnb() {
  const { isSuccess } = useMeQuery()

  return isSuccess ? <ApplicantGnb /> : <GuestGnb />
}

export { PublicGnb }
