import Link from 'next/link'
import BellIcon from '@/assets/icons/bell.svg'
import { Button } from '@/components/ui/Button/button'
import { Gnb } from './gnb'
import { OrganizationSelector } from './organizationSelector'
import { ProfileMenu } from './profileMenu'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { Route } from 'next'

const meta = {
  title: 'UI/Gnb',
  component: Gnb,
  parameters: {
    controls: { disable: true },
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/recruits' } },
  },
} satisfies Meta<typeof Gnb>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

// 실제 route가 아닌 표시용 경로라 typedRoutes 검사를 피하려고 문자열을 Route로 변환
function toStoryRoute(path: string) {
  return path as Route
}

const APPLICANT_NAV_ITEMS = [
  { label: '전체 공고', href: toStoryRoute('/recruits') },
  { label: '내 지원', href: toStoryRoute('/applications') },
]

const ORGANIZER_NAV_ITEMS = [
  { label: '전체 공고', href: toStoryRoute('/recruits') },
  { label: '단체 관리', href: toStoryRoute('/organizations') },
  { label: '모집 관리', href: toStoryRoute('/manage') },
]

const LOGGED_OUT_NAV_ITEMS = [
  { label: '전체 공고', href: toStoryRoute('/recruits') },
  { label: '단체 둘러보기', href: toStoryRoute('/organizations') },
]

const PROFILE_MENU_PROPS = {
  name: '김모집',
  myPageHref: toStoryRoute('/mypage'),
  switchModeHref: toStoryRoute('/manage'),
  logoutHref: toStoryRoute('/'),
}

// ui가 features를 import하지 않도록 트리거 모양만 표시
const NOTIFICATION_TRIGGER = (
  <Button variant="tertiary" size="m" aria-label="알림" className="size-10 text-neutral">
    <BellIcon aria-hidden className="size-4.5" />
  </Button>
)

export const Applicant: Story = {
  render: () => (
    <Gnb
      navItems={APPLICANT_NAV_ITEMS}
      actions={
        <>
          {NOTIFICATION_TRIGGER}
          <ProfileMenu mode="applicant" {...PROFILE_MENU_PROPS} />
        </>
      }
    />
  ),
}

export const Organizer: Story = {
  parameters: { nextjs: { appDirectory: true, navigation: { pathname: '/manage' } } },
  render: () => (
    <Gnb
      navItems={ORGANIZER_NAV_ITEMS}
      actions={
        <>
          <OrganizationSelector name="UXUX" />
          {NOTIFICATION_TRIGGER}
          <ProfileMenu mode="organizer" {...PROFILE_MENU_PROPS} />
        </>
      }
    />
  ),
}

export const LoggedOut: Story = {
  render: () => (
    <Gnb
      navItems={LOGGED_OUT_NAV_ITEMS}
      actions={
        <>
          <Button asChild variant="tertiary" size="m">
            <Link href={toStoryRoute('/login')}>로그인</Link>
          </Button>
          <Button asChild variant="primary" size="m">
            <Link href={toStoryRoute('/signup')}>회원가입</Link>
          </Button>
        </>
      }
    />
  ),
}
