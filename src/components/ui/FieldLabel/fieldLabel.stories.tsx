import { FieldLabel } from './fieldLabel'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/FieldLabel',
  component: FieldLabel,
  parameters: { layout: 'padded' },
  args: { id: 'field-label', label: '모집 시작', required: false },
} satisfies Meta<typeof FieldLabel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Required: Story = { args: { required: true } }
