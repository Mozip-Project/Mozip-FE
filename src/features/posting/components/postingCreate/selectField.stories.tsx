import { useState } from 'react'
import { SelectField } from './selectField'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const DURATION_OPTIONS = [
  { value: '30', label: '30분' },
  { value: '60', label: '60분' },
  { value: '90', label: '90분' },
] as const

type Duration = (typeof DURATION_OPTIONS)[number]['value']

function SelectFieldStory({ initialValue = null }: { initialValue?: Duration | null }) {
  const [value, setValue] = useState<Duration | null>(initialValue)

  return (
    <SelectField
      className="w-60"
      label="면접 1회 시간"
      placeholder="30분"
      options={DURATION_OPTIONS}
      value={value}
      onValueChange={setValue}
    />
  )
}

const meta = {
  title: 'Features/Posting/SelectField',
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { render: () => <SelectFieldStory /> }

export const Selected: Story = { render: () => <SelectFieldStory initialValue="30" /> }
