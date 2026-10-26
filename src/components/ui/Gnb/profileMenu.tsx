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
import type { Route } from 'next'

type ProfileMenuMode = 'applicant' | 'organizer'

const SWITCH_MODE_LABEL = {
  applicant: '운영진 모드로 전환',
  organizer: '지원자 모드로 전환',
} satisfies Record<ProfileMenuMode, string>

// TODO: 모드 전환·로그아웃 동작 연결 (인증·계정 구분 방식 결정 후)
type ProfileMenuProps = {
  name: string
  mode: ProfileMenuMode
  myPageHref: Route
}

function ProfileMenu({ name, mode, myPageHref }: ProfileMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="프로필 메뉴"
        className="size-10 shrink-0 cursor-pointer rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid [&_svg]:size-full"
      >
        <ProfileIcon aria-hidden />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={20} className="w-60">
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
          <DropdownMenuItem>
            <RefreshIcon aria-hidden />
            {SWITCH_MODE_LABEL[mode]}
          </DropdownMenuItem>
        </div>

        <DropdownMenuItem className="h-auto justify-center rounded-none bg-neutral-weak px-0 py-padding-s text-neutral-subtle focus:bg-neutral-weak-pressed">
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { ProfileMenu }
