import { ApplicantChip } from './applicantChip'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/ApplicantChip',
  component: ApplicantChip,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof ApplicantChip>

export default meta
type Story = StoryObj

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <ApplicantChip name="김모집" isDone />
      <ApplicantChip name="김모집" isCurrent isDone />
      <ApplicantChip name="김모집" isCurrent />
      <ApplicantChip name="김모집" />
    </div>
  ),
}

export const LongName: Story = {
  render: () => <ApplicantChip name="아주긴이름을가진지원자의이름표시" isCurrent />,
}
