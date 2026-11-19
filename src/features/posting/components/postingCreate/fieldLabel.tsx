import { cn } from '@/lib/utils'

type FieldLabelProps = {
  id: string
  label: string
  required?: boolean
  isHidden?: boolean
}

function FieldLabel({ id, label, required = false, isHidden = false }: FieldLabelProps) {
  return (
    <span
      id={id}
      className={cn(
        'flex items-center gap-gap-xs text-label1 font-semibold whitespace-nowrap text-neutral',
        isHidden && 'sr-only',
      )}
    >
      {label}
      {required && (
        <>
          <span aria-hidden className="text-critical">
            *
          </span>
          <span className="sr-only">필수</span>
        </>
      )}
    </span>
  )
}

export { FieldLabel }
export type { FieldLabelProps }
