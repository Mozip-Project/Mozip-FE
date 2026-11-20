import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type FieldLabelProps = {
  id: string
  label: string
  required?: boolean
  isHidden?: boolean
  info?: ReactNode
}

function FieldLabel({ id, label, required = false, isHidden = false, info }: FieldLabelProps) {
  return (
    <span
      className={cn(
        'flex items-center gap-gap-xs text-label1 font-semibold whitespace-nowrap text-neutral',
        isHidden && 'sr-only',
      )}
    >
      <span id={id}>
        {label}
        {required && (
          <>
            {' '}
            <span className="sr-only">필수</span>
          </>
        )}
      </span>
      {info}
      {required && (
        <span aria-hidden className="text-critical">
          *
        </span>
      )}
    </span>
  )
}

export { FieldLabel }
export type { FieldLabelProps }
