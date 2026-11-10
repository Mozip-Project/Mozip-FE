import { z } from 'zod'

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,}$/
const VERIFICATION_CODE_PATTERN = /^\d{6}$/

const PASSWORD_RULE_MESSAGE = '영문/숫자/특수문자 포함 8자 이상 입력해 주세요'
const PASSWORD_MISMATCH_MESSAGE = '비밀번호가 일치하지 않습니다'
const CURRENT_PASSWORD_REQUIRED_MESSAGE = '현재 비밀번호를 입력해 주세요'
const VERIFICATION_CODE_MESSAGE = '인증번호 6자리를 입력해 주세요'

const accountEditSchema = z
  .object({
    name: z.string(),
    newPhone: z.string(),
    verificationCode: z
      .string()
      .regex(VERIFICATION_CODE_PATTERN, VERIFICATION_CODE_MESSAGE)
      .or(z.literal('')),
    currentPassword: z.string(),
    newPassword: z.string().regex(PASSWORD_PATTERN, PASSWORD_RULE_MESSAGE).or(z.literal('')),
    newPasswordConfirm: z.string(),
  })
  .superRefine(({ currentPassword, newPassword, newPasswordConfirm }, context) => {
    const isChangingPassword = Boolean(currentPassword || newPassword || newPasswordConfirm)

    if (!isChangingPassword) {
      return
    }

    if (!currentPassword) {
      context.addIssue({
        code: 'custom',
        path: ['currentPassword'],
        message: CURRENT_PASSWORD_REQUIRED_MESSAGE,
      })
    }

    if (!newPassword) {
      context.addIssue({ code: 'custom', path: ['newPassword'], message: PASSWORD_RULE_MESSAGE })
    }

    if (newPasswordConfirm !== newPassword) {
      context.addIssue({
        code: 'custom',
        path: ['newPasswordConfirm'],
        message: PASSWORD_MISMATCH_MESSAGE,
      })
    }
  })

type AccountEditValues = z.infer<typeof accountEditSchema>

export { PASSWORD_RULE_MESSAGE, VERIFICATION_CODE_PATTERN, accountEditSchema }
export type { AccountEditValues }
