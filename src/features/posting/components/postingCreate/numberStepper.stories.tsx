import { useState } from 'react'
import { NumberStepper } from './numberStepper'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

function NumberStepperStory({ initialValue }: { initialValue: number }) {
  const [value, setValue] = useState(initialValue)

  return (
    <NumberStepper
      label="면접관 수"
      value={value}
      onValueChange={setValue}
      min={1}
      max={10}
      unit="명"
    />
  )
}

const meta = {
  title: 'Features/Posting/NumberStepper',
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { render: () => <NumberStepperStory initialValue={3} /> }

export const AtMin: Story = { render: () => <NumberStepperStory initialValue={1} /> }
