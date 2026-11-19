import { useState } from 'react'
import BoldIcon from '@/assets/icons/bold.svg'
import { ToolButton } from './toolButton'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Features/Posting/ToolButton',
  component: ToolButton,
  parameters: { layout: 'padded' },
  args: { label: '굵게', isActive: false, children: <BoldIcon aria-hidden /> },
} satisfies Meta<typeof ToolButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Active: Story = { args: { isActive: true } }

function ToggleToolButton() {
  const [isActive, setIsActive] = useState(false)

  return (
    <ToolButton label="굵게" isActive={isActive} onClick={() => setIsActive(!isActive)}>
      <BoldIcon aria-hidden />
    </ToolButton>
  )
}

export const Toggle: Story = { render: () => <ToggleToolButton /> }
