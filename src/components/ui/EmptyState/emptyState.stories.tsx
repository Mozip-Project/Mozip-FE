import LinkIcon from '@/assets/icons/link.svg'
import PlusIcon from '@/assets/icons/plus.svg'
import UsersIcon from '@/assets/icons/users.svg'
import { Button } from '@/components/ui/Button/button'
import { EmptyState } from './emptyState'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/EmptyState',
  component: EmptyState,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof EmptyState>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <EmptyState
      icon={<UsersIcon />}
      title="아직 지원자가 없어요"
      description="설명 텍스트"
      actions={
        <>
          <Button variant="secondary" size="m">
            <LinkIcon aria-hidden />
            버튼
          </Button>
          <Button size="m">
            <PlusIcon aria-hidden />
            버튼
          </Button>
        </>
      }
    />
  ),
}

export const TextOnly: Story = {
  render: () => <EmptyState icon={<UsersIcon />} title="아직 지원자가 없어요" />,
}
