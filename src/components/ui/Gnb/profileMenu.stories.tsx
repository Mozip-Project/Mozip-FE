import { ProfileMenu } from './profileMenu'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/Gnb/ProfileMenu',
  component: ProfileMenu,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof ProfileMenu>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <div className="flex h-80 justify-end gap-gap-xxl p-padding-xl">
      <ProfileMenu
        name="김모집"
        mode="applicant"
        myPageHref="/"
        switchModeHref="/"
        logoutHref="/"
      />
      <ProfileMenu
        name="김모집"
        mode="organizer"
        myPageHref="/"
        switchModeHref="/"
        logoutHref="/"
      />
    </div>
  ),
}
