'use client'

import { Button } from '@/components/ui/Button/button'
import { useLogout } from '@/features/user/hooks/useLogout'
import { ApiError } from '@/lib/apiError'
import { useToast } from '@/providers/toastProvider'

const LOGOUT_FAILED_DESCRIPTION = '잠시 후 다시 시도해 주세요'

function LogoutButton() {
  const { showToast } = useToast()
  const logoutMutation = useLogout()

  function handleClick() {
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

  return (
    <Button variant="secondary" size="m" disabled={logoutMutation.isPending} onClick={handleClick}>
      로그아웃
    </Button>
  )
}

export { LogoutButton }
