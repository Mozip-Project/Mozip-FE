import { delay, HttpResponse } from 'msw'
import type {
  ChangePasswordMutation,
  ChangePasswordMutationVariables,
  RequestPhoneChangeMutation,
  RequestPhoneChangeMutationVariables,
  UpdateProfileMutation,
  UpdateProfileMutationVariables,
  VerifyPhoneChangeMutation,
  VerifyPhoneChangeMutationVariables,
} from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { MOCK_RESPONSE_DELAY_MS } from '@/mocks/responseDelay'
import { getMockAccount, updateMockAccount } from './userHandlers'
import type { GraphQLResponseBody } from 'msw/graphql'

// 명세: 3분 유효, 같은 번호 1분에 1회, 인증 후 10분 안에 저장
const VERIFICATION_CODE_VALID_MS = 3 * 60 * 1000
const PHONE_REQUEST_INTERVAL_MS = 60 * 1000
const VERIFIED_PHONE_VALID_MS = 10 * 60 * 1000

// 명세는 개발 환경 고정 인증번호만 정하고 번호는 없어 임의로 정함
const MOCK_VERIFICATION_CODE = '123456'
// 명세의 개발 서버 개발용 회원 번호(01000000001~3) 사용, USER_001 확인용
const REGISTERED_PHONES = ['01000000001', '01000000002', '01000000003']
// 가상의 값, 현재 비밀번호 불일치(AUTH_001) 확인용
const INITIAL_PASSWORD = 'mozip1234!'

let phoneRequestedAt = new Map<string, number>()
let phoneVerifiedAt = new Map<string, number>()
let currentPassword = INITIAL_PASSWORD

function resetAccountEdit() {
  phoneRequestedAt = new Map()
  phoneVerifiedAt = new Map()
  currentPassword = INITIAL_PASSWORD
}

function isWithin(timestamp: number | undefined, durationMs: number) {
  return timestamp !== undefined && Date.now() - timestamp <= durationMs
}

// data가 null인 응답은 어떤 operation 결과 자리에도 들어갈 수 있게 never로 고정
function errorResponse(code: string, message: string) {
  return HttpResponse.json<GraphQLResponseBody<never>>({
    errors: [{ message, extensions: { code } }],
    data: null,
  })
}

const accountEditHandlers = [
  graphqlApi.mutation<RequestPhoneChangeMutation, RequestPhoneChangeMutationVariables>(
    'RequestPhoneChange',
    async ({ variables: { phone } }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)

      if (phone === getMockAccount().phone || REGISTERED_PHONES.includes(phone)) {
        return errorResponse('USER_001', '이미 가입된 휴대폰 번호입니다.')
      }
      if (isWithin(phoneRequestedAt.get(phone), PHONE_REQUEST_INTERVAL_MS)) {
        return errorResponse('USER_429', '잠시 후 다시 요청해 주세요.')
      }
      phoneRequestedAt.set(phone, Date.now())
      return HttpResponse.json({ data: { requestPhoneChange: true } })
    },
  ),

  graphqlApi.mutation<VerifyPhoneChangeMutation, VerifyPhoneChangeMutationVariables>(
    'VerifyPhoneChange',
    async ({ variables: { phone, code } }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)

      const isCodeValid =
        code === MOCK_VERIFICATION_CODE &&
        isWithin(phoneRequestedAt.get(phone), VERIFICATION_CODE_VALID_MS)
      if (!isCodeValid) {
        return errorResponse('USER_400', '인증번호가 일치하지 않거나 만료되었습니다.')
      }
      phoneVerifiedAt.set(phone, Date.now())
      return HttpResponse.json({ data: { verifyPhoneChange: true } })
    },
  ),

  graphqlApi.mutation<UpdateProfileMutation, UpdateProfileMutationVariables>(
    'UpdateProfile',
    async ({ variables: { input } }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)

      const name = input.name?.trim()
      if (input.name != null && !name) {
        return HttpResponse.json({
          errors: [
            {
              message: '입력값을 확인해 주세요.',
              extensions: {
                code: 'COMMON_400',
                fieldErrors: [{ field: 'name', message: '이름을 입력해 주세요' }],
              },
            },
          ],
          data: null,
        })
      }
      if (input.phone && !isWithin(phoneVerifiedAt.get(input.phone), VERIFIED_PHONE_VALID_MS)) {
        return errorResponse('USER_403', '인증되지 않은 휴대폰 번호입니다.')
      }

      const account = updateMockAccount({
        ...(name ? { name } : {}),
        ...(input.phone ? { phone: input.phone } : {}),
        // 명세상 빈 문자열이면 기본 아바타, 보내지 않으면 유지
        ...(input.profileImageUrl != null
          ? { profileImageUrl: input.profileImageUrl || null }
          : {}),
      })
      return HttpResponse.json({ data: { updateProfile: account } })
    },
  ),

  graphqlApi.mutation<ChangePasswordMutation, ChangePasswordMutationVariables>(
    'ChangePassword',
    async ({ variables: { input } }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)

      if (input.currentPassword !== currentPassword) {
        return errorResponse('AUTH_001', '휴대폰 번호 또는 비밀번호가 일치하지 않습니다.')
      }
      currentPassword = input.newPassword
      return HttpResponse.json({ data: { changePassword: true } })
    },
  ),
]

export { accountEditHandlers, MOCK_VERIFICATION_CODE, resetAccountEdit }
