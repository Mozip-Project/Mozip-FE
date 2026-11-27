import type { Role } from '@/gql/graphql'

const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => ['notifications', 'list'] as const,
  list: (role: Role | undefined) => ['notifications', 'list', role ?? 'ALL'] as const,
  unreadCount: ['notifications', 'unreadCount'] as const,
}

export { notificationKeys }
