import { SaveStatus } from './saveStatus'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/SaveStatus',
  component: SaveStatus,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof SaveStatus>

export default meta
type Story = StoryObj

function todayAt(hours: number, minutes: number) {
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date
}

function daysAgoAt(days: number, hours: number, minutes: number) {
  const date = todayAt(hours, minutes)
  date.setDate(date.getDate() - days)
  return date
}

export const States: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <SaveStatus status="saving" />
      <SaveStatus status="saved" savedAt={todayAt(14, 32)} />
      <SaveStatus status="failed" />
    </div>
  ),
}

export const SavedBeforeToday: Story = {
  render: () => <SaveStatus status="saved" savedAt={daysAgoAt(1, 14, 32)} />,
}
