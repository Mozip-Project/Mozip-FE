import {
  MarkNotificationsReadDocument,
  NotificationsDocument,
  NotificationUnreadCountDocument,
  type Role,
} from '@/gql/graphql'
import { requestGraphQL } from '@/lib/graphqlClient'

const NOTIFICATION_PAGE_SIZE = 20

// TODO: role 생략 시 전체 조회는 서버 반영 예정
async function getNotifications(role: Role | undefined, page: number) {
  const data = await requestGraphQL(NotificationsDocument, {
    role,
    page,
    size: NOTIFICATION_PAGE_SIZE,
  })
  return data.notifications
}

// TODO: 탭별 안 읽은 개수는 서버 반영 예정, 지금은 합계 하나
async function getNotificationUnreadCount() {
  const data = await requestGraphQL(NotificationUnreadCountDocument)
  return data.me.unreadNotificationCount
}

async function markNotificationsRead(ids: string[]) {
  const data = await requestGraphQL(MarkNotificationsReadDocument, { ids })
  return data.markNotificationsRead
}

export {
  getNotifications,
  getNotificationUnreadCount,
  markNotificationsRead,
  NOTIFICATION_PAGE_SIZE,
}
