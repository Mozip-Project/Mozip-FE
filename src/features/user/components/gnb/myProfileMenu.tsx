'use client'

import { ProfileMenu } from '@/components/ui/Gnb/profileMenu'
import { useMeQuery } from '@/features/user/api/queries'
import { useLogoutWithToast } from '@/features/user/hooks/useLogoutWithToast'
import type { ComponentProps } from 'react'

// mode별 union이 유지되도록 타입마다 이름, 로그아웃 제외
type WithoutUserProps<Props> = Props extends unknown ? Omit<Props, 'name' | 'onLogout'> : never
type MyProfileMenuProps = WithoutUserProps<ComponentProps<typeof ProfileMenu>>

// 조회 전에는 이름 자리를 비워 둠
function MyProfileMenu(props: MyProfileMenuProps) {
  const { data: me } = useMeQuery()
  const { logout } = useLogoutWithToast()

  return <ProfileMenu {...props} name={me?.name ?? ''} onLogout={logout} />
}

export { MyProfileMenu }
