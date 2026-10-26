import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

const buttonVariants = cva(
  [
    'inline-flex shrink-0 cursor-pointer items-center justify-center gap-gap-xs font-semibold whitespace-nowrap select-none',
    'transition-colors outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none',
    'disabled:pointer-events-none',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-brand-solid text-on-brand-solid hover:bg-brand-solid-pressed',
          'disabled:bg-disabled disabled:text-disabled',
        ],
        secondary: [
          'border border-neutral-muted bg-layer-default text-neutral hover:border-neutral-weak hover:bg-layer-default-pressed',
          'disabled:border-neutral-muted disabled:bg-disabled disabled:text-disabled',
        ],
        tertiary: [
          'text-neutral-muted hover:bg-transparent-pressed hover:text-neutral',
          'disabled:text-disabled',
        ],
      },
      size: {
        l: "h-12 rounded-m px-padding-xl text-body1 [&_svg:not([class*='size-'])]:size-5",
        m: "h-10 rounded-s px-padding-m text-body2 [&_svg:not([class*='size-'])]:size-4.5",
        s: "h-8 rounded-s px-padding-s text-label1 [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'l',
    },
  },
)

function Button({
  className,
  variant = 'primary',
  size = 'l',
  asChild = false,
  ...props
}: ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      // form 안에서 의도치 않은 submit 방지, asChild면 자식 요소의 속성 유지
      type={asChild ? undefined : 'button'}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
