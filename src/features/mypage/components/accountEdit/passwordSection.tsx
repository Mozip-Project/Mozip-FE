import { useController, type Control, type UseFormTrigger } from 'react-hook-form'
import { TextField } from '@/components/ui/TextField/textField'
import {
  PASSWORD_RULE_MESSAGE,
  type AccountEditValues,
} from '@/features/mypage/schemas/accountEditSchema'
import type { ChangeEvent } from 'react'

const PASSWORD_MATCH_MESSAGE = '비밀번호가 일치해요'

type PasswordSectionProps = {
  control: Control<AccountEditValues>
  trigger: UseFormTrigger<AccountEditValues>
}

function PasswordSection({ control, trigger }: PasswordSectionProps) {
  const { field: currentField, fieldState: currentState } = useController({
    control,
    name: 'currentPassword',
  })
  const { field: newField, fieldState: newState } = useController({
    control,
    name: 'newPassword',
  })
  const { field: confirmField, fieldState: confirmState } = useController({
    control,
    name: 'newPasswordConfirm',
  })

  const isChangingPassword = Boolean(currentField.value || newField.value || confirmField.value)
  const isConfirmMatched =
    confirmField.value !== '' && confirmField.value === newField.value && !confirmState.invalid
  const confirmHelper =
    confirmState.error?.message ?? (isConfirmMatched ? PASSWORD_MATCH_MESSAGE : undefined)

  function handleNewPasswordChange(event: ChangeEvent<HTMLInputElement>) {
    newField.onChange(event)

    if (confirmState.isTouched) {
      void trigger('newPasswordConfirm')
    }
  }

  return (
    <section className="flex flex-col gap-gap-l">
      <div className="flex flex-col gap-gap-xxs">
        <h2 className="text-headline1 font-semibold text-neutral">비밀번호</h2>
        <p className="text-label2 text-neutral-subtle">
          현재 비밀번호 확인 후 새 비밀번호를 설정해 주세요
        </p>
      </div>
      {/* TODO: 현재 비밀번호 확인 방식(저장 시 함께 전송 또는 확인 API) 백엔드와 결정 */}
      <TextField
        {...currentField}
        label="현재 비밀번호"
        type="password"
        autoComplete="current-password"
        placeholder="현재 비밀번호를 입력해 주세요"
        required={isChangingPassword}
        aria-invalid={currentState.invalid}
        helper={currentState.error?.message}
      />
      <div className="flex items-start gap-gap-m">
        <TextField
          {...newField}
          onChange={handleNewPasswordChange}
          label="새 비밀번호"
          type="password"
          autoComplete="new-password"
          placeholder="새 비밀번호를 입력해 주세요"
          required={isChangingPassword}
          aria-invalid={newState.invalid}
          helper={newState.error?.message ?? PASSWORD_RULE_MESSAGE}
          className="min-w-0 flex-1"
        />
        <TextField
          {...confirmField}
          label="새 비밀번호 확인"
          type="password"
          autoComplete="new-password"
          placeholder="새 비밀번호를 한 번 더 입력해 주세요"
          required={isChangingPassword}
          aria-invalid={confirmState.invalid}
          helper={confirmHelper}
          className="min-w-0 flex-1"
        />
      </div>
    </section>
  )
}

export { PasswordSection }
