import { useState, type ChangeEvent } from 'react'
import { useController, type Control } from 'react-hook-form'
import { Button } from '@/components/ui/Button/button'
import { TextField } from '@/components/ui/TextField/textField'
import {
  VERIFICATION_CODE_PATTERN,
  type AccountEditValues,
} from '@/features/mypage/schemas/accountEditSchema'
import { useCountdown } from '@/hooks/useCountdown'
import { formatRemainingTime } from '@/utils/date'
import { formatPhoneNumber } from '@/utils/phone'

const VERIFICATION_DURATION_SECONDS = 180
const PHONE_PATTERN = /^01[016789]-\d{3,4}-\d{4}$/
const CODE_SENT_MESSAGE = '인증번호가 발송되었습니다.'
const VERIFIED_MESSAGE = '인증이 완료되었습니다.'

type PhoneSectionProps = {
  control: Control<AccountEditValues>
  maskedPhone: string
  isVerified: boolean
  onVerified: (phone: string) => void
}

function PhoneSection({ control, maskedPhone, isVerified, onVerified }: PhoneSectionProps) {
  const { field: newPhoneField } = useController({ control, name: 'newPhone' })
  const { field: codeField, fieldState: codeState } = useController({
    control,
    name: 'verificationCode',
  })
  const [sentPhone, setSentPhone] = useState<string | null>(null)
  const countdown = useCountdown()

  const newPhone = newPhoneField.value
  const isChangingPhone = newPhone !== ''
  // 발송 후 번호를 고치면 다시 받아야 하므로 발송한 번호와 같을 때만 인증 단계 유지
  const isCodeSent = sentPhone !== null && sentPhone === newPhone
  const canSendCode = PHONE_PATTERN.test(newPhone) && !isVerified
  const canEnterCode = isCodeSent && !isVerified
  const canConfirmCode =
    canEnterCode && countdown.isRunning && VERIFICATION_CODE_PATTERN.test(codeField.value)
  const remainingTimeMessage = canEnterCode
    ? `남은 시간 ${formatRemainingTime(countdown.remainingSeconds)}`
    : undefined

  let verificationStatus = ''
  if (isVerified) {
    verificationStatus = VERIFIED_MESSAGE
  } else if (isCodeSent) {
    verificationStatus = CODE_SENT_MESSAGE
  }

  function handleNewPhoneChange(event: ChangeEvent<HTMLInputElement>) {
    newPhoneField.onChange(formatPhoneNumber(event.target.value))
  }

  function handleCodeChange(event: ChangeEvent<HTMLInputElement>) {
    codeField.onChange(event.target.value.replace(/\D/g, ''))
  }

  function handleSendCode() {
    // TODO: 인증번호 발송 API 연결
    setSentPhone(newPhone)
    codeField.onChange('')
    countdown.start(VERIFICATION_DURATION_SECONDS)
  }

  function handleConfirmCode() {
    // TODO: 인증번호 확인 API 연결, 틀리면 인증번호 입력에 오류 표시
    countdown.stop()
    onVerified(newPhone)
  }

  return (
    <section className="flex flex-col gap-gap-l">
      <div className="flex flex-col gap-gap-xxs">
        <h2 className="text-headline1 font-semibold text-neutral">휴대폰 번호</h2>
        <p className="text-label2 text-neutral-subtle">새 번호 인증 후 저장해 주세요</p>
      </div>
      <TextField label="현재 번호" defaultValue={maskedPhone} disabled />
      <div className="flex items-start gap-gap-s">
        <TextField
          {...newPhoneField}
          onChange={handleNewPhoneChange}
          label="새 휴대폰 번호"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="010-0000-0000"
          required={isChangingPhone}
          helper={isCodeSent ? CODE_SENT_MESSAGE : undefined}
          className="min-w-0 flex-1"
        />
        <Button
          variant="secondary"
          disabled={!canSendCode}
          onClick={handleSendCode}
          className="mt-7"
        >
          인증번호 받기
        </Button>
      </div>
      <div className="flex items-start gap-gap-s">
        <TextField
          {...codeField}
          onChange={handleCodeChange}
          label="인증번호 입력"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="인증번호 6자리"
          maxLength={6}
          required={isChangingPhone}
          disabled={!canEnterCode}
          aria-invalid={codeState.invalid}
          helper={codeState.error?.message ?? remainingTimeMessage}
          className="min-w-0 flex-1"
        />
        <Button
          variant="secondary"
          disabled={!canConfirmCode}
          onClick={handleConfirmCode}
          className="mt-7"
        >
          확인
        </Button>
      </div>
      <p role="status" className="sr-only">
        {verificationStatus}
      </p>
    </section>
  )
}

export { PhoneSection }
