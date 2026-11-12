import TrashIcon from '@/assets/icons/trash.svg'
import { DropdownMenuItem } from '@/components/ui/DropdownMenu/dropdownMenu'
import { ActionMenu } from './actionMenu'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/ActionMenu',
  component: ActionMenu,
  parameters: { layout: 'centered', controls: { disable: true } },
} satisfies Meta<typeof ActionMenu>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <ActionMenu label="UXUX 15기 운영진 추가 모집 메뉴">
      <DropdownMenuItem>
        <TrashIcon aria-hidden />
        공고 삭제
      </DropdownMenuItem>
    </ActionMenu>
  ),
}
