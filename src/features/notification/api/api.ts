import { MarkNotificationsReadDocument, NotificationsDocument } from '@/gql/graphql'
import { requestGraphQL } from '@/lib/graphqlClient'

async function getNotifications() {
  const data = await requestGraphQL(NotificationsDocument)
  return data.notifications.items
}

async function markNotificationsRead(ids: string[]) {
  const data = await requestGraphQL(MarkNotificationsReadDocument, { ids })
  return data.markNotificationsRead
}

export { getNotifications, markNotificationsRead }
