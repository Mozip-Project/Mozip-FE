'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/Button/button'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import {
  accountEditSchema,
  type AccountEditValues,
} from '@/features/mypage/schemas/accountEditSchema'
import { NameSection } from './nameSection'
import { PasswordSection } from './passwordSection'
import { PhoneSection } from './phoneSection'
import { ProfileImageSection } from './profileImageSection'

const ACCOUNT_EDIT_BACK_LINK = { href: '/manage/mypage', label: '계정 설정' } as const

type AccountEditFormProps = {
  name: string
  maskedPhone: string
}

function AccountEditForm({ name, maskedPhone }: AccountEditFormProps) {
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null)
  const {
    control,
    handleSubmit,
    trigger,
    formState: { isDirty, errors },
  } = useForm<AccountEditValues>({
    mode: 'onTouched',
    resolver: zodResolver(accountEditSchema),
    defaultValues: {
      profileImage: null,
      name,
      newPhone: '',
      verificationCode: '',
      currentPassword: '',
      newPassword: '',
      newPasswordConfirm: '',
    },
  })

  const newPhone = useWatch({ control, name: 'newPhone' })
  const isPhoneVerified = newPhone !== '' && verifiedPhone === newPhone
  const isPhoneVerificationPending = newPhone !== '' && !isPhoneVerified
  const hasVisibleError = Object.keys(errors).length > 0
  const canSave = isDirty && !hasVisibleError && !isPhoneVerificationPending

  function handleSave() {
    // TODO: 계정 정보 저장 API 연결
  }

  return (
    <form
      noValidate
      onSubmit={(event) => void handleSubmit(handleSave)(event)}
      className="flex flex-col gap-gap-l"
    >
      <PageHeader
        title="정보 수정"
        backLink={ACCOUNT_EDIT_BACK_LINK}
        actions={
          <Button type="submit" size="m" disabled={!canSave}>
            저장
          </Button>
        }
      />
      <div className="flex flex-col gap-gap-xxl">
        <ProfileImageSection control={control} />
        <NameSection control={control} />
        <PhoneSection
          control={control}
          maskedPhone={maskedPhone}
          isVerified={isPhoneVerified}
          onVerified={setVerifiedPhone}
        />
        <PasswordSection control={control} trigger={trigger} />
      </div>
    </form>
  )
}

export { ACCOUNT_EDIT_BACK_LINK, AccountEditForm }
