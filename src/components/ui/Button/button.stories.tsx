import ChevronRightIcon from '@/assets/icons/chevronRight.svg'
import PlusIcon from '@/assets/icons/plus.svg'
import { Button } from './button'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ComponentProps } from 'react'

type ButtonVariant = NonNullable<ComponentProps<typeof Button>['variant']>

const VARIANTS = ['primary', 'secondary', 'tertiary', 'critical'] as const
const SIZES = ['l', 'm', 's'] as const

function SizeMatrix({ variant }: { variant: ButtonVariant }) {
  return (
    <div className="flex flex-col gap-gap-l">
      {SIZES.map((size) => (
        <div key={size} className="flex items-center gap-gap-l">
          <Button variant={variant} size={size}>
            버튼
          </Button>
          <Button variant={variant} size={size} disabled>
            버튼
          </Button>
        </div>
      ))}
    </div>
  )
}

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: () => <SizeMatrix variant="primary" />,
}

export const Secondary: Story = {
  render: () => <SizeMatrix variant="secondary" />,
}

export const Tertiary: Story = {
  render: () => <SizeMatrix variant="tertiary" />,
}

export const Critical: Story = {
  render: () => <SizeMatrix variant="critical" />,
}

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-col gap-gap-l">
      {VARIANTS.map((variant) =>
        SIZES.map((size) => (
          <div key={`${variant}-${size}`} className="flex items-center gap-gap-l">
            <Button variant={variant} size={size}>
              <PlusIcon aria-hidden />
              버튼
              <ChevronRightIcon aria-hidden />
            </Button>
            <Button variant={variant} size={size} disabled>
              <PlusIcon aria-hidden />
              버튼
              <ChevronRightIcon aria-hidden />
            </Button>
          </div>
        )),
      )}
    </div>
  ),
}
