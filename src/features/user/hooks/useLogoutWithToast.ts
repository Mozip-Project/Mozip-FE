import { useLogout } from '@/features/user/hooks/useLogout'
import { ApiError } from '@/lib/apiError'
import { useToast } from '@/providers/toastProvider'

const LOGOUT_FAILED_DESCRIPTION = '잠시 후 다시 시도해 주세요'

// 실패하면 이동하지 않고 토스트로 안내, GNB와 계정 설정의 로그아웃 공용
function useLogoutWithToast() {
  const { showToast } = useToast()
  const logoutMutation = useLogout()

  function logout() {
    logoutMutation.mutate(undefined, {
      onError: (error) => {
        showToast({
          title: '로그아웃하지 못했어요',
          description: error instanceof ApiError ? error.message : LOGOUT_FAILED_DESCRIPTION,
          icon: 'alert',
        })
      },
    })
  }

  return { logout, isLoggingOut: logoutMutation.isPending }
}

export { useLogoutWithToast }
