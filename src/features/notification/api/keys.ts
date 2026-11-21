import type { NotificationTab } from '@/gql/graphql'

const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => ['notifications', 'list'] as const,
  list: (tab: NotificationTab | undefined) => ['notifications', 'list', tab ?? 'ALL'] as const,
  unreadCount: ['notifications', 'unreadCount'] as const,
}

export { notificationKeys }
