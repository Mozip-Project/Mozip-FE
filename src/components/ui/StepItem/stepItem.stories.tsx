import { StepItem } from './stepItem'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/StepItem',
  component: StepItem,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <ol className="flex gap-gap-xl">
        <Story />
      </ol>
    ),
  ],
  args: { number: 1, label: '요청 확인', state: 'current' },
} satisfies Meta<typeof StepItem>

export default meta
type Story = StoryObj<typeof meta>

export const Done: Story = { args: { state: 'done' } }

export const Current: Story = { args: { state: 'current' } }

export const Upcoming: Story = { args: { state: 'upcoming' } }

export const AllStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <>
      <StepItem number={1} label="요청 확인" state="done" />
      <StepItem number={1} label="요청 확인" state="current" />
      <StepItem number={1} label="요청 확인" state="upcoming" />
    </>
  ),
}
