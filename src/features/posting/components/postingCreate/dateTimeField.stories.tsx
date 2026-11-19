import { useState } from 'react'
import type { TimeOptionType } from '@/utils/time'
import { DateTimeField } from './dateTimeField'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

function DateTimeFieldStory({
  label,
  timeType,
  initialDate = null,
  initialTime = null,
}: {
  label: string
  timeType: TimeOptionType
  initialDate?: string | null
  initialTime?: string | null
}) {
  const [date, setDate] = useState(initialDate)
  const [time, setTime] = useState(initialTime)

  return (
    <DateTimeField
      className="w-110"
      label={label}
      required
      date={date}
      onDateChange={setDate}
      time={time}
      timeType={timeType}
      timePlaceholder="오전 12:00"
      onTimeChange={setTime}
    />
  )
}

const meta = {
  title: 'Features/Posting/DateTimeField',
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <DateTimeFieldStory label="모집 시작" timeType="start" />,
}

export const Start: Story = {
  render: () => (
    <DateTimeFieldStory
      label="모집 시작"
      timeType="start"
      initialDate="2026-10-01"
      initialTime="00:00"
    />
  ),
}

export const End: Story = {
  render: () => (
    <DateTimeFieldStory
      label="모집 마감"
      timeType="end"
      initialDate="2026-10-15"
      initialTime="23:59"
    />
  ),
}
