import { http, HttpResponse } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { MOCK_VERIFICATION_CODE, resetAccountEdit } from '@/features/user/mocks/accountEditHandlers'
import { resetMyAccount } from '@/features/user/mocks/userHandlers'
import { ApiError } from '@/lib/apiError'
import { graphqlApi } from '@/mocks/graphqlApi'
import { server } from '@/mocks/server'
import {
  changePassword,
  logout,
  requestPhoneChange,
  updateProfile,
  verifyPhoneChange,
  withdraw,
} from './api'

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
})

afterEach(() => {
  resetMyAccount()
  resetAccountEdit()
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('logout', () => {
  it('MSW 기본 응답으로 성공', async () => {
    await expect(logout()).resolves.toBeUndefined()
  })

  it('AUTH_006이면 쿠키가 남아 있으므로 ApiError로 실패', async () => {
    server.use(
      http.post('*/auth/logout', () =>
        HttpResponse.json(
          {
            success: false,
            code: 'AUTH_006',
            message: '로그인 처리를 잠시 할 수 없습니다. 잠시 후 다시 시도해 주세요.',
            data: null,
            traceId: 'trace-1',
          },
          { status: 503 },
        ),
      ),
    )

    await expect(logout()).rejects.toBeInstanceOf(ApiError)
    await expect(logout()).rejects.toMatchObject({ code: 'AUTH_006' })
  })
})

describe('withdraw', () => {
  it('MSW 기본 응답으로 성공', async () => {
    await expect(withdraw()).resolves.toBe(true)
  })

  it('대표자로 있는 단체가 남아 있으면 USER_409 ApiError로 실패', async () => {
    server.use(
      graphqlApi.mutation('Withdraw', () =>
        HttpResponse.json({
          errors: [
            {
              message: '대표자로 있는 단체가 있어 탈퇴할 수 없습니다.',
              extensions: { code: 'USER_409' },
            },
          ],
          data: null,
        }),
      ),
    )

    await expect(withdraw()).rejects.toMatchObject({ code: 'USER_409' })
  })
})

// 개발 중 화면 확인에 쓰는 MSW 흐름이 명세 규칙대로 응답하는지 확인
describe('정보 수정', () => {
  const NEW_PHONE = '01098765432'

  it('인증번호 요청·확인을 거친 번호와 이름을 저장하면 바뀐 계정 반환', async () => {
    await expect(requestPhoneChange(NEW_PHONE)).resolves.toBe(true)
    await expect(verifyPhoneChange(NEW_PHONE, MOCK_VERIFICATION_CODE)).resolves.toBe(true)

    await expect(updateProfile({ name: '이모집', phone: NEW_PHONE })).resolves.toMatchObject({
      name: '이모집',
      phone: NEW_PHONE,
    })
  })

  it('이미 가입된 번호로 인증번호를 요청하면 USER_001', async () => {
    await expect(requestPhoneChange('01000000002')).rejects.toMatchObject({ code: 'USER_001' })
  })

  it('같은 번호로 바로 다시 요청하면 USER_429', async () => {
    await requestPhoneChange(NEW_PHONE)

    await expect(requestPhoneChange(NEW_PHONE)).rejects.toMatchObject({ code: 'USER_429' })
  })

  it('인증번호가 틀리면 USER_400', async () => {
    await requestPhoneChange(NEW_PHONE)

    await expect(verifyPhoneChange(NEW_PHONE, '000000')).rejects.toMatchObject({
      code: 'USER_400',
    })
  })

  it('인증하지 않은 번호로 저장하면 USER_403', async () => {
    await expect(updateProfile({ phone: NEW_PHONE })).rejects.toMatchObject({ code: 'USER_403' })
  })

  it('현재 비밀번호가 틀리면 AUTH_001, 맞으면 변경', async () => {
    await expect(
      changePassword({ currentPassword: 'wrong-password1!', newPassword: 'newpass123!' }),
    ).rejects.toMatchObject({ code: 'AUTH_001' })
    await expect(
      changePassword({ currentPassword: 'mozip1234!', newPassword: 'newpass123!' }),
    ).resolves.toBe(true)
  })
})
