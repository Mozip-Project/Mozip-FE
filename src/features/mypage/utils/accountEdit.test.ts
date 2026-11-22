import { describe, expect, it } from 'vitest'
import type { AccountEditValues } from '@/features/mypage/schemas/accountEditSchema'
import { toChangePasswordInput, toPhoneDigits, toUpdateProfileInput } from './accountEdit'

const VALUES: AccountEditValues = {
  profileImage: null,
  name: '김모집',
  newPhone: '',
  verificationCode: '',
  currentPassword: '',
  newPassword: '',
  newPasswordConfirm: '',
}
const CONTEXT = { savedName: '김모집', verifiedPhone: null }

describe('toPhoneDigits', () => {
  it('하이픈을 지우고 숫자만 남김', () => {
    expect(toPhoneDigits('010-9876-5432')).toBe('01098765432')
  })
})

describe('toChangePasswordInput', () => {
  it('비밀번호 칸이 비어 있으면 변경하지 않음', () => {
    expect(toChangePasswordInput(VALUES)).toBeNull()
  })

  it('현재·새 비밀번호를 입력하면 변경 입력으로 만듦', () => {
    expect(
      toChangePasswordInput({
        ...VALUES,
        currentPassword: 'mozip1234!',
        newPassword: 'newpass123!',
        newPasswordConfirm: 'newpass123!',
      }),
    ).toEqual({ currentPassword: 'mozip1234!', newPassword: 'newpass123!' })
  })
})

describe('toUpdateProfileInput', () => {
  it('이름과 번호가 그대로면 요청하지 않음', () => {
    expect(toUpdateProfileInput(VALUES, CONTEXT)).toBeNull()
  })

  it('앞뒤 공백만 다른 이름은 바뀌지 않은 것으로 봄', () => {
    expect(toUpdateProfileInput({ ...VALUES, name: ' 김모집 ' }, CONTEXT)).toBeNull()
  })

  it('바뀐 이름은 공백을 지워 보냄', () => {
    expect(toUpdateProfileInput({ ...VALUES, name: ' 이모집 ' }, CONTEXT)).toEqual({
      name: '이모집',
    })
  })

  it('인증한 번호만 숫자로 바꿔 보냄', () => {
    expect(
      toUpdateProfileInput(
        { ...VALUES, newPhone: '010-9876-5432' },
        { ...CONTEXT, verifiedPhone: '010-9876-5432' },
      ),
    ).toEqual({ phone: '01098765432' })
  })

  it('인증하지 않은 번호는 보내지 않음', () => {
    expect(
      toUpdateProfileInput(
        { ...VALUES, newPhone: '010-9876-5432' },
        { ...CONTEXT, verifiedPhone: '010-1111-2222' },
      ),
    ).toBeNull()
  })
})
