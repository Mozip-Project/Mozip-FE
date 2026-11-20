import {
  MarkNotificationsReadDocument,
  NotificationsDocument,
  NotificationUnreadCountDocument,
  type NotificationTab,
} from '@/gql/graphql'
import { requestGraphQL } from '@/lib/graphqlClient'

// tab 생략 시 전체 탭
async function getNotifications(tab: NotificationTab | undefined, page: number) {
  const data = await requestGraphQL(NotificationsDocument, { tab, page })
  return data.notifications
}

// 목록과 같은 필드에서 탭 배지 숫자만 조회
async function getNotificationUnreadCount() {
  const data = await requestGraphQL(NotificationUnreadCountDocument)
  return data.notifications.unreadCount
}

async function markNotificationsRead(ids: string[]) {
  const data = await requestGraphQL(MarkNotificationsReadDocument, { ids })
  return data.markNotificationsRead
}

export { getNotifications, getNotificationUnreadCount, markNotificationsRead }
