import { useController, type Control } from 'react-hook-form'
import { TextField } from '@/components/ui/TextField/textField'
import type { AccountEditValues } from '@/features/mypage/schemas/accountEditSchema'

type NameSectionProps = {
  control: Control<AccountEditValues>
}

function NameSection({ control }: NameSectionProps) {
  const { field, fieldState } = useController({ control, name: 'name' })

  return (
    <section className="flex flex-col gap-gap-l">
      <h2 className="text-headline1 font-semibold text-neutral">이름</h2>
      <TextField
        {...field}
        aria-label="이름"
        autoComplete="name"
        aria-invalid={fieldState.invalid}
        helper={fieldState.error?.message}
      />
    </section>
  )
}

export { NameSection }
