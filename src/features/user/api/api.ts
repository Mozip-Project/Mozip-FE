import {
  MeDocument,
  MyAccountDocument,
  UpdateNotificationSettingsDocument,
  WithdrawDocument,
  type NotificationSettingsInput,
} from '@/gql/graphql'
import { requestGraphQL } from '@/lib/graphqlClient'
import { postRest } from '@/lib/restClient'

const LOGOUT_PATH = '/auth/logout'

async function getMe() {
  const data = await requestGraphQL(MeDocument)
  return data.me
}

async function getMyAccount() {
  const data = await requestGraphQL(MyAccountDocument)
  return data.me
}

async function updateNotificationSettings(input: NotificationSettingsInput) {
  const data = await requestGraphQL(UpdateNotificationSettingsDocument, { input })
  return data.updateNotificationSettings
}

// 토큰이 없거나 만료돼도 성공, AUTH_006이면 쿠키가 남아 있어 ApiError로 전달
async function logout() {
  await postRest(LOGOUT_PATH)
}

async function withdraw() {
  const data = await requestGraphQL(WithdrawDocument)
  return data.withdraw
}

export { getMe, getMyAccount, logout, updateNotificationSettings, withdraw }
