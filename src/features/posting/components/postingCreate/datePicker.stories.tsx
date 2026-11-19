import { useState } from 'react'
import { DatePicker } from './datePicker'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

function DatePickerStory({ initialValue }: { initialValue: string | null }) {
  const [value, setValue] = useState(initialValue)

  return (
    <div className="w-fit rounded-l border border-neutral-muted bg-layer-default p-padding-m shadow-floating">
      <DatePicker value={value} onValueChange={setValue} />
    </div>
  )
}

const meta = {
  title: 'Features/Posting/DatePicker',
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Selected: Story = { render: () => <DatePickerStory initialValue="2026-10-01" /> }

export const Empty: Story = { render: () => <DatePickerStory initialValue={null} /> }
