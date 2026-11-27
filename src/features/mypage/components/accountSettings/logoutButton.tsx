'use client'

import { Button } from '@/components/ui/Button/button'
import { useLogoutWithToast } from '@/features/user/hooks/useLogoutWithToast'

function LogoutButton() {
  const { logout, isLoggingOut } = useLogoutWithToast()

  return (
    <Button variant="secondary" size="m" disabled={isLoggingOut} onClick={logout}>
      로그아웃
    </Button>
  )
}

export { LogoutButton }
