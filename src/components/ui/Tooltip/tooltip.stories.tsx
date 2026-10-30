import { Button } from '@/components/ui/Button/button'
import { Tooltip } from './tooltip'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/Tooltip',
  component: Tooltip,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof Tooltip>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

export const Placements: Story = {
  render: () => (
    <div className="flex gap-gap-xxl p-padding-xxl">
      <Tooltip label="합격 2 · 보류 1 · 불합격 0">
        <Button variant="secondary" size="s">
          위쪽
        </Button>
      </Tooltip>
      <Tooltip label="합격 2 · 보류 1 · 불합격 0" side="bottom">
        <Button variant="secondary" size="s">
          아래쪽
        </Button>
      </Tooltip>
    </div>
  ),
}
