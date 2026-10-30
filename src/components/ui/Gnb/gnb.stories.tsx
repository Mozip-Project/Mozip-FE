import { Gnb } from './gnb'
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

// 실제 route가 아직 없어 typedRoutes 검사를 피하려고 문자열을 Route로 변환
function toStoryRoute(path: string) {
  return path as Route
}

const APPLICANT_NAV_ITEMS = [
  { label: '전체 공고', href: toStoryRoute('/recruits') },
  { label: '스크랩', href: toStoryRoute('/scraps') },
  { label: '내 지원', href: toStoryRoute('/applications') },
  { label: '캘린더', href: toStoryRoute('/calendar') },
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

const SIGNED_IN_USER = {
  userName: '김모집',
  myPageHref: toStoryRoute('/mypage'),
}

export const Applicant: Story = {
  render: () => <Gnb type="applicant" navItems={APPLICANT_NAV_ITEMS} {...SIGNED_IN_USER} />,
}

export const Organizer: Story = {
  parameters: { nextjs: { appDirectory: true, navigation: { pathname: '/manage' } } },
  render: () => (
    <Gnb
      type="organizer"
      navItems={ORGANIZER_NAV_ITEMS}
      organizationName="UXUX"
      {...SIGNED_IN_USER}
    />
  ),
}

export const LoggedOut: Story = {
  render: () => (
    <Gnb
      type="loggedOut"
      navItems={LOGGED_OUT_NAV_ITEMS}
      loginHref={toStoryRoute('/login')}
      signupHref={toStoryRoute('/signup')}
    />
  ),
}
