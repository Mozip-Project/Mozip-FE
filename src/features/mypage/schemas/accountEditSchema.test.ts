import { describe, expect, it } from 'vitest'
import { accountEditSchema, type AccountEditValues } from './accountEditSchema'

const EMPTY_VALUES: AccountEditValues = {
  name: '김모집',
  newPhone: '',
  verificationCode: '',
  currentPassword: '',
  newPassword: '',
  newPasswordConfirm: '',
}

const CURRENT_PASSWORD = 'current1!'
const VALID_PASSWORD = 'mozip123!'

function getIssues(values: Partial<AccountEditValues>) {
  return accountEditSchema.safeParse({ ...EMPTY_VALUES, ...values }).error?.issues ?? []
}

describe('accountEditSchema', () => {
  it('휴대폰·비밀번호를 바꾸지 않아 비어 있으면 통과', () => {
    expect(getIssues({})).toEqual([])
  })

  describe('비밀번호 변경 시작', () => {
    it('세 칸을 모두 올바르게 입력하면 통과', () => {
      expect(
        getIssues({
          currentPassword: CURRENT_PASSWORD,
          newPassword: VALID_PASSWORD,
          newPasswordConfirm: VALID_PASSWORD,
        }),
      ).toEqual([])
    })

    it('현재 비밀번호만 입력하면 새 비밀번호 칸에 조건 오류', () => {
      expect(getIssues({ currentPassword: CURRENT_PASSWORD })).toEqual([
        expect.objectContaining({
          path: ['newPassword'],
          message: '영문/숫자/특수문자 포함 8자 이상 입력해 주세요',
        }),
      ])
    })

    it('새 비밀번호를 입력하고 현재 비밀번호가 비어 있으면 현재 비밀번호 필수 오류', () => {
      expect(
        getIssues({ newPassword: VALID_PASSWORD, newPasswordConfirm: VALID_PASSWORD }),
      ).toEqual([
        expect.objectContaining({
          path: ['currentPassword'],
          message: '현재 비밀번호를 입력해 주세요',
        }),
      ])
    })
  })

  describe('새 비밀번호 조건', () => {
    it('영문·숫자·특수문자를 모두 포함한 8자는 통과', () => {
      expect(
        getIssues({
          currentPassword: CURRENT_PASSWORD,
          newPassword: 'abcd12!@',
          newPasswordConfirm: 'abcd12!@',
        }),
      ).toEqual([])
    })

    it.each([
      ['7자', 'abc12!@'],
      ['특수문자 없음', 'abcd1234'],
      ['숫자 없음', 'abcdefg!'],
      ['영문 없음', '1234567!'],
      ['공백을 특수문자로 사용', 'abcd 1234'],
    ])('%s이면 조건 오류', (_, newPassword) => {
      expect(
        getIssues({
          currentPassword: CURRENT_PASSWORD,
          newPassword,
          newPasswordConfirm: newPassword,
        }),
      ).toEqual([
        expect.objectContaining({
          path: ['newPassword'],
          message: '영문/숫자/특수문자 포함 8자 이상 입력해 주세요',
        }),
      ])
    })
  })

  describe('새 비밀번호 확인', () => {
    it('새 비밀번호와 다르면 확인 칸에 불일치 오류', () => {
      expect(
        getIssues({
          currentPassword: CURRENT_PASSWORD,
          newPassword: VALID_PASSWORD,
          newPasswordConfirm: 'mozip123?',
        }),
      ).toEqual([
        expect.objectContaining({
          path: ['newPasswordConfirm'],
          message: '비밀번호가 일치하지 않습니다',
        }),
      ])
    })

    it('새 비밀번호만 입력하고 확인 칸이 비어 있어도 불일치 오류', () => {
      expect(getIssues({ currentPassword: CURRENT_PASSWORD, newPassword: VALID_PASSWORD })).toEqual(
        [expect.objectContaining({ path: ['newPasswordConfirm'] })],
      )
    })
  })

  describe('인증번호', () => {
    it('숫자 6자리는 통과', () => {
      expect(getIssues({ verificationCode: '123456' })).toEqual([])
    })

    it.each([
      ['5자리', '12345'],
      ['7자리', '1234567'],
      ['숫자가 아닌 문자 포함', '12345a'],
    ])('%s이면 오류', (_, verificationCode) => {
      expect(getIssues({ verificationCode })).toEqual([
        expect.objectContaining({
          path: ['verificationCode'],
          message: '인증번호 6자리를 입력해 주세요',
        }),
      ])
    })
  })
})
