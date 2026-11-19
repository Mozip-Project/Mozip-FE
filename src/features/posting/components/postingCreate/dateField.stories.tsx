import { useState } from 'react'
import { DateField } from './dateField'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

function DateFieldStory({
  initialValue = null,
  isLabelHidden,
}: {
  initialValue?: string | null
  isLabelHidden?: boolean
}) {
  const [value, setValue] = useState(initialValue)

  return (
    <DateField
      className="w-60"
      label="모집 시작"
      required
      isLabelHidden={isLabelHidden}
      value={value}
      onValueChange={setValue}
    />
  )
}

const meta = {
  title: 'Features/Posting/DateField',
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { render: () => <DateFieldStory /> }

export const Filled: Story = { render: () => <DateFieldStory initialValue="2026-10-01" /> }

export const LabelHidden: Story = { render: () => <DateFieldStory isLabelHidden /> }
