import { useController, type Control, type UseFormTrigger } from 'react-hook-form'
import { TextField } from '@/components/ui/TextField/textField'
import {
  PASSWORD_RULE_MESSAGE,
  type AccountEditValues,
} from '@/features/mypage/schemas/accountEditSchema'
import type { ChangeEvent } from 'react'

const PASSWORD_MATCH_MESSAGE = '비밀번호가 일치해요'

type PasswordFieldName = 'currentPassword' | 'newPassword' | 'newPasswordConfirm'

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

  // superRefine 오류는 칸마다 따로 갱신되므로 오류가 있는(또는 확인 칸이 touched인) 다른 칸만 재검사
  function revalidateOtherPasswordFields(changed: PasswordFieldName) {
    const staleFields = (
      [
        ['currentPassword', currentState.invalid],
        ['newPassword', newState.invalid],
        ['newPasswordConfirm', confirmState.invalid || confirmState.isTouched],
      ] as const
    )
      .filter(([name, needsRevalidation]) => name !== changed && needsRevalidation)
      .map(([name]) => name)

    if (staleFields.length > 0) {
      void trigger(staleFields)
    }
  }

  function handleCurrentPasswordChange(event: ChangeEvent<HTMLInputElement>) {
    currentField.onChange(event)
    revalidateOtherPasswordFields('currentPassword')
  }

  function handleNewPasswordChange(event: ChangeEvent<HTMLInputElement>) {
    newField.onChange(event)
    revalidateOtherPasswordFields('newPassword')
  }

  function handleConfirmPasswordChange(event: ChangeEvent<HTMLInputElement>) {
    confirmField.onChange(event)
    revalidateOtherPasswordFields('newPasswordConfirm')
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
        onChange={handleCurrentPasswordChange}
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
          onChange={handleConfirmPasswordChange}
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
