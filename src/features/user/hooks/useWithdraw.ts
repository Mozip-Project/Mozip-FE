import { useMutation } from '@tanstack/react-query'
import { logout, withdraw } from '@/features/user/api/api'
import { moveToLoggedOutHome } from './useLogout'

async function withdrawAndLogout() {
  const isWithdrawn = await withdraw()
  if (!isWithdrawn) {
    throw new Error('회원 탈퇴를 완료하지 못했습니다.')
  }
  // 탈퇴는 이미 끝나 로그아웃 실패와 관계없이 이동, 남은 쿠키는 재발급 때 AUTH_005로 삭제됨
  await logout().catch(() => undefined)
}

// USER_409(대표자로 있는 단체 남음)는 이동하지 않고 error로 전달
function useWithdraw() {
  return useMutation({ mutationFn: withdrawAndLogout, onSuccess: moveToLoggedOutHome })
}

export { useWithdraw }
