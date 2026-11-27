import { useMutation } from '@tanstack/react-query'
import { logout } from '@/features/user/api/api'
import { reserveLogoutNotice } from '@/features/user/utils/logoutNotice'

const LOGGED_OUT_HOME_PATH = '/'

// 이전 계정의 쿼리 캐시와 모듈 상태를 모두 비우도록 새로고침 이동
function moveToLoggedOutHome() {
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- 이전 계정 캐시 초기화
  window.location.assign(LOGGED_OUT_HOME_PATH)
}

// AUTH_006이면 쿠키가 남아 있어 이동하지 않고 error로 전달
function useLogout() {
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      reserveLogoutNotice()
      moveToLoggedOutHome()
    },
  })
}

export { moveToLoggedOutHome, useLogout }
