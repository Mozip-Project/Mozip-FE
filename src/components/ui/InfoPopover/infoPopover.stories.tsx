import { Button } from '@/components/ui/Button/button'
import { InfoPopover } from './infoPopover'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/InfoPopover',
  component: InfoPopover,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof InfoPopover>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <InfoPopover
      trigger={
        <Button variant="secondary" size="s">
          권한 안내
        </Button>
      }
      title="권한 안내"
      description={
        '대표자: 결제 및 이용권 관리, 운영진 관리, 대표 권한 이전, 면접 및 결과 안내\n운영진: 지원자 관리, 면접 및 결과 안내'
      }
    />
  ),
}
