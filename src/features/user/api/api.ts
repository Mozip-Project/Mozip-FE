import {
  MeDocument,
  MyAccountDocument,
  UpdateNotificationSettingsDocument,
  type NotificationSettingsInput,
} from '@/gql/graphql'
import { requestGraphQL } from '@/lib/graphqlClient'

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

export { getMe, getMyAccount, updateNotificationSettings }
