'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch, type UseFormSetError } from 'react-hook-form'
import { Button } from '@/components/ui/Button/button'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { StickyTopBar } from '@/components/ui/StickyTopBar/stickyTopBar'
import {
  accountEditSchema,
  type AccountEditValues,
} from '@/features/mypage/schemas/accountEditSchema'
import {
  getServerErrorMessage,
  toChangePasswordInput,
  toUpdateProfileInput,
} from '@/features/mypage/utils/accountEdit'
import { useChangePasswordMutation, useUpdateProfileMutation } from '@/features/user/api/queries'
import { ApiError } from '@/lib/apiError'
import { useToast } from '@/providers/toastProvider'
import { NameSection } from './nameSection'
import { PasswordSection } from './passwordSection'
import { PhoneSection } from './phoneSection'
import { ProfileImageSection } from './profileImageSection'

const ACCOUNT_EDIT_BACK_LINK = { href: '/manage/mypage', label: '계정 설정' } as const

const WRONG_CURRENT_PASSWORD_CODE = 'AUTH_001'
const UNVERIFIED_PHONE_CODE = 'USER_403'
// 서버 fieldErrors의 field 중 화면에 입력 칸이 있는 것
const SERVER_FIELD_NAMES = ['name', 'currentPassword', 'newPassword'] as const

type AccountEditFormProps = {
  name: string
  maskedPhone: string
}

function createEmptyValues(name: string): AccountEditValues {
  return {
    profileImage: null,
    name,
    newPhone: '',
    verificationCode: '',
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: '',
  }
}

// 입력 칸이 있는 서버 오류는 칸 옆에 표시하고 첫 칸으로 이동, 표시했으면 true
function applyServerFieldErrors(error: Error, setError: UseFormSetError<AccountEditValues>) {
  if (!(error instanceof ApiError)) {
    return false
  }
  if (error.code === WRONG_CURRENT_PASSWORD_CODE) {
    setError('currentPassword', { type: 'server', message: error.message }, { shouldFocus: true })
    return true
  }

  const fieldErrors = error.fieldErrors.flatMap(({ field, message }) => {
    const fieldName = SERVER_FIELD_NAMES.find((name) => name === field)
    return fieldName ? [{ fieldName, message }] : []
  })
  fieldErrors.forEach(({ fieldName, message }, index) => {
    setError(fieldName, { type: 'server', message }, { shouldFocus: index === 0 })
  })
  return fieldErrors.length > 0
}

function AccountEditForm({ name, maskedPhone }: AccountEditFormProps) {
  const { showToast } = useToast()
  const changePassword = useChangePasswordMutation()
  const updateProfile = useUpdateProfileMutation()
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null)
  const {
    control,
    handleSubmit,
    trigger,
    reset,
    resetField,
    setError,
    formState: { isDirty, isSubmitting, errors, defaultValues },
  } = useForm<AccountEditValues>({
    mode: 'onTouched',
    resolver: zodResolver(accountEditSchema),
    defaultValues: createEmptyValues(name),
  })

  const newPhone = useWatch({ control, name: 'newPhone' })
  const isPhoneVerified = newPhone !== '' && verifiedPhone === newPhone
  const isPhoneVerificationPending = newPhone !== '' && !isPhoneVerified
  const hasVisibleError = Object.keys(errors).length > 0
  const canSave = isDirty && !hasVisibleError && !isPhoneVerificationPending && !isSubmitting

  function showSaveFailed(title: string, error: Error) {
    showToast({ title, description: getServerErrorMessage(error), icon: 'alert' })
  }

  // 현재 비밀번호 불일치가 가장 흔한 실패라 비밀번호를 먼저 바꿔 실패 시 아무것도 저장하지 않음
  async function handleSave(values: AccountEditValues) {
    const passwordInput = toChangePasswordInput(values)
    // 조회로 바뀔 수 있는 name prop 대신 폼이 불러오거나 저장한 이름과 비교, 최신 서버 이름 덮어쓰기 방지
    const savedName = defaultValues?.name ?? name
    const profileInput = toUpdateProfileInput(values, { savedName, verifiedPhone })
    // TODO: 프로필 이미지만 바꾼 경우는 업로드 API 배포 후 저장, 지금은 보낼 값이 없어 요청하지 않음
    if (!passwordInput && !profileInput) {
      return
    }

    if (passwordInput) {
      try {
        await changePassword.mutateAsync(passwordInput)
      } catch (error) {
        if (error instanceof Error && !applyServerFieldErrors(error, setError)) {
          showSaveFailed('비밀번호를 변경하지 못했어요', error)
        }
        return
      }
    }

    if (profileInput) {
      try {
        const account = await updateProfile.mutateAsync(profileInput)
        reset(createEmptyValues(account.name))
        setVerifiedPhone(null)
      } catch (error) {
        if (!(error instanceof Error)) {
          return
        }
        if (error instanceof ApiError && error.code === UNVERIFIED_PHONE_CODE) {
          setVerifiedPhone(null)
        }
        const hasFieldError = applyServerFieldErrors(error, setError)

        // 비밀번호는 이미 바뀌어 칸 오류가 있어도 항상 알림
        if (passwordInput) {
          resetField('currentPassword')
          resetField('newPassword')
          resetField('newPasswordConfirm')
          showSaveFailed('비밀번호만 변경하고 나머지는 저장하지 못했어요', error)
        } else if (!hasFieldError) {
          showSaveFailed('정보를 저장하지 못했어요', error)
        }
        return
      }
    } else {
      reset(createEmptyValues(name))
    }

    showToast({ title: '정보를 저장했어요' })
  }

  return (
    <form
      noValidate
      onSubmit={(event) => void handleSubmit(handleSave)(event)}
      className="flex flex-col"
    >
      {/* 긴 폼에서도 저장 버튼이 보이도록 헤더 전체를 화면 위에 고정 */}
      {/* 헤더 위에 다른 내용이 없어 위 가림막을 항상 켜 빠른 스크롤 때 고정 판정 지연으로 비침 방지 */}
      <StickyTopBar className="pb-gap-l after:opacity-100 after:transition-none">
        <PageHeader
          title="정보 수정"
          backLink={ACCOUNT_EDIT_BACK_LINK}
          actions={
            <Button type="submit" size="m" disabled={!canSave}>
              저장
            </Button>
          }
        />
      </StickyTopBar>
      {/* 공용 스크롤 여백은 48px 바 기준이라 더 높은 헤더에 focus된 칸이 가리지 않게 남는 높이만큼 추가 */}
      {/* 저장 중 입력이 응답 후 reset으로 덮어써지지 않도록 모든 입력 잠금 */}
      <fieldset
        disabled={isSubmitting}
        className="flex min-w-0 flex-col gap-gap-xxl [&_input]:scroll-mt-10"
      >
        <ProfileImageSection control={control} />
        <NameSection control={control} />
        <PhoneSection
          control={control}
          maskedPhone={maskedPhone}
          isVerified={isPhoneVerified}
          onVerified={setVerifiedPhone}
        />
        <PasswordSection control={control} trigger={trigger} />
      </fieldset>
    </form>
  )
}

export { ACCOUNT_EDIT_BACK_LINK, AccountEditForm }
