'use client'

import Link from 'next/link'
import ProfileIcon from '@/assets/icons/profile.svg'
import RefreshIcon from '@/assets/icons/refresh.svg'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu/dropdownMenu'
import { usePointerFocus } from '@/hooks/usePointerFocus'
import type { Route } from 'next'

type ProfileMenuMode = 'applicant' | 'organizer'

const SWITCH_MODE_LABEL = {
  applicant: '운영진 모드로 전환',
  organizer: '지원자 모드로 전환',
} satisfies Record<ProfileMenuMode, string>

// TODO: 실제 모드 전환·로그아웃 연결 (인증·계정 구분 방식 결정 후), 현재는 화면 이동만 처리
type ProfileMenuProps = {
  name: string
  mode: ProfileMenuMode
  myPageHref: Route
  switchModeHref: Route
  logoutHref: Route
}

function ProfileMenu({ name, mode, myPageHref, switchModeHref, logoutHref }: ProfileMenuProps) {
  const { isPointerFocus, markPointerFocus } = usePointerFocus()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="프로필 메뉴"
        data-pointer-focus={isPointerFocus ? '' : undefined}
        onPointerDown={markPointerFocus}
        className="size-10 shrink-0 cursor-pointer rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid data-pointer-focus:focus-visible:outline-none [&_svg]:size-full"
      >
        <ProfileIcon aria-hidden />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <p className="truncate px-padding-m pt-5 pb-padding-s text-headline2 font-semibold text-neutral">
          {name}
        </p>

        <div className="p-padding-xs">
          <DropdownMenuItem asChild>
            <Link href={myPageHref}>마이페이지</Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        <div className="p-padding-xs">
          <DropdownMenuItem asChild>
            <Link href={switchModeHref}>
              <RefreshIcon aria-hidden />
              {SWITCH_MODE_LABEL[mode]}
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuItem
          asChild
          className="h-auto justify-center rounded-none bg-neutral-weak px-0 py-padding-s text-neutral-subtle focus:bg-neutral-weak-pressed"
        >
          <Link href={logoutHref}>로그아웃</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { ProfileMenu }
