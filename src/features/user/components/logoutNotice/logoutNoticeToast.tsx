'use client'

import { useEffect, useRef } from 'react'
import { takeLogoutNotice } from '@/features/user/utils/logoutNotice'
import { useToast } from '@/providers/toastProvider'

// 로그아웃으로 이동해 온 첫 화면에서만 완료 안내
function LogoutNoticeToast() {
  const { showToast } = useToast()
  const hasCheckedRef = useRef(false)

  useEffect(() => {
    // showToast가 렌더마다 바뀌어도 마운트 때 한 번만 확인
    if (hasCheckedRef.current) {
      return
    }
    hasCheckedRef.current = true

    if (takeLogoutNotice()) {
      showToast({ title: '로그아웃했어요' })
    }
  }, [showToast])

  return null
}

export { LogoutNoticeToast }
