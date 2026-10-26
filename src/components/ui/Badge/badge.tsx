import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

export const BADGE_TONES = [
  'brand',
  'neutral',
  'positive',
  'warning',
  'critical',
  'informative',
] as const
export const BADGE_VARIANTS = ['solid', 'weak'] as const

type BadgeTone = (typeof BADGE_TONES)[number]
type BadgeVariant = (typeof BADGE_VARIANTS)[number]

const BADGE_COLOR_CLASS = {
  brand: {
    solid: 'bg-brand-solid text-on-brand-solid',
    weak: 'bg-brand-weak text-brand',
  },
  neutral: {
    solid: 'bg-neutral-solid text-on-neutral-solid',
    weak: 'bg-neutral-weak text-neutral-muted',
  },
  positive: {
    solid: 'bg-positive-solid text-on-positive-solid',
    weak: 'bg-positive-weak text-positive',
  },
  warning: {
    solid: 'bg-warning-solid text-on-warning-solid',
    weak: 'bg-warning-weak text-warning',
  },
  critical: {
    solid: 'bg-critical-solid text-on-critical-solid',
    weak: 'bg-critical-weak text-critical',
  },
  informative: {
    solid: 'bg-informative-solid text-on-informative-solid',
    weak: 'bg-informative-weak text-informative',
  },
} satisfies Record<BadgeTone, Record<BadgeVariant, string>>

type BadgeProps = ComponentProps<'span'> & {
  tone?: BadgeTone
  variant?: BadgeVariant
}

export function Badge({ tone = 'brand', variant = 'solid', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center justify-center rounded-xs px-padding-xs text-caption1 font-semibold whitespace-nowrap',
        BADGE_COLOR_CLASS[tone][variant],
        className,
      )}
      {...props}
    />
  )
}
