import { BADGE_TONES, Badge } from './badge'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ComponentProps } from 'react'

type BadgeVariant = NonNullable<ComponentProps<typeof Badge>['variant']>

function ToneRow({ variant }: { variant: BadgeVariant }) {
  return (
    <div className="flex items-center gap-gap-m">
      {BADGE_TONES.map((tone) => (
        <Badge key={tone} tone={tone} variant={variant}>
          배지
        </Badge>
      ))}
    </div>
  )
}

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Solid: Story = {
  render: () => <ToneRow variant="solid" />,
}

export const Weak: Story = {
  render: () => <ToneRow variant="weak" />,
}
