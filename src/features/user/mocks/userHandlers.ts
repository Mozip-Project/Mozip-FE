import { delay, HttpResponse } from 'msw'
import type {
  MeQuery,
  MeQueryVariables,
  MyAccountFieldsFragment,
  MyAccountQuery,
  MyAccountQueryVariables,
  NotificationSettingsInput,
  UpdateNotificationSettingsMutation,
  UpdateNotificationSettingsMutationVariables,
} from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { MOCK_RESPONSE_DELAY_MS } from '@/mocks/responseDelay'

// 이름은 모두 가상, 단체 1은 대표자·단체 2는 운영진으로 소속
const ME_SAMPLE = {
  id: 'user-1',
  lastOrganization: { id: '1' },
  memberships: [
    { role: 'REPRESENTATIVE', organization: { id: '1', name: 'UXUX' } },
    { role: 'OPERATOR', organization: { id: '2', name: '멋쟁이개발자' } },
  ],
} satisfies MeQuery['me']

// ME_SAMPLE과 같은 회원·소속, 학교·이메일·전화번호는 가상
function createInitialAccount(): MyAccountFieldsFragment {
  return {
    id: 'user-1',
    phone: '01012345678',
    name: '김모집',
    school: { name: '모집대학교' },
    schoolVerification: {
      schoolName: null,
      email: 'mozip@mozip.ac.kr',
      school: { name: '모집대학교' },
    },
    memberships: [
      {
        id: 'member-1',
        role: 'REPRESENTATIVE',
        organization: { id: '1', name: 'UXUX' },
        team: { name: '기획팀' },
      },
      {
        id: 'member-2',
        role: 'OPERATOR',
        organization: { id: '2', name: '멋쟁이개발자' },
        team: null,
      },
    ],
    notificationSettings: {
      notifyResult: true,
      notifyScrap: true,
      notifyOperator: true,
      marketingAgreed: false,
    },
  }
}

// 저장 결과가 새로고침 전까지 유지되도록 메모리에 보관
let account = createInitialAccount()

function resetMyAccount() {
  account = createInitialAccount()
}

// 명세상 보내지 않은(null) 필드는 기존 값 유지
function applyNotificationSettings(input: NotificationSettingsInput) {
  const current = account.notificationSettings
  account = {
    ...account,
    notificationSettings: {
      notifyResult: input.notifyResult ?? current.notifyResult,
      notifyScrap: input.notifyScrap ?? current.notifyScrap,
      notifyOperator: input.notifyOperator ?? current.notifyOperator,
      marketingAgreed: input.marketingAgreed ?? current.marketingAgreed,
    },
  }
  return account
}

const userHandlers = [
  graphqlApi.query<MeQuery, MeQueryVariables>('Me', async () => {
    await delay(MOCK_RESPONSE_DELAY_MS)
    return HttpResponse.json({ data: { me: ME_SAMPLE } })
  }),

  graphqlApi.query<MyAccountQuery, MyAccountQueryVariables>('MyAccount', async () => {
    await delay(MOCK_RESPONSE_DELAY_MS)
    return HttpResponse.json({ data: { me: account } })
  }),

  graphqlApi.mutation<
    UpdateNotificationSettingsMutation,
    UpdateNotificationSettingsMutationVariables
  >('UpdateNotificationSettings', async ({ variables }) => {
    await delay(MOCK_RESPONSE_DELAY_MS)
    return HttpResponse.json({
      data: { updateNotificationSettings: applyNotificationSettings(variables.input) },
    })
  }),
]

export { resetMyAccount, userHandlers }
