import { Callout } from './callout'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/Callout',
  component: Callout,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof Callout>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

const REPRESENTATIVE_CHANGE_ITEMS = [
  '새로운 대표자가 되어 결제, 운영진 관리, 대표자 변경 권한을 넘겨받아요',
  '현재 대표자가 휴대폰 본인 인증을 마치고 승인하면 대표자 변경이 완료돼요',
  '승인 전까지는 기존 권한이 유지되며, 요청은 언제든 취소할 수 있어요',
]

export const Default: Story = {
  render: () => (
    <Callout
      title="승인하면 이렇게 변경돼요"
      items={REPRESENTATIVE_CHANGE_ITEMS}
      className="w-160"
    />
  ),
}

export const Narrow: Story = {
  render: () => (
    <Callout
      title="승인하면 이렇게 변경돼요"
      items={REPRESENTATIVE_CHANGE_ITEMS}
      className="w-[343px]"
    />
  ),
}
