import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toNotificationEntries } from '@/features/notification/utils/notificationEntry'
import type { NotificationsQuery } from '@/gql/graphql'
import { getNotifications, markNotificationsRead } from './api'
import { notificationKeys } from './keys'

type NotificationItems = NotificationsQuery['notifications']['items']

// 패널을 열 때마다 새로 조회하도록 staleTime 0
function useNotificationsQuery() {
  return useQuery({
    queryKey: notificationKeys.list,
    queryFn: getNotifications,
    select: (items) => toNotificationEntries(items, new Date()),
    staleTime: 0,
  })
}

function useMarkNotificationsReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markNotificationsRead,
    onSuccess: (isMarked, ids) => {
      if (!isMarked) {
        return
      }
      queryClient.setQueryData<NotificationItems>(notificationKeys.list, (items) =>
        items?.map((item) => (ids.includes(item.id) ? { ...item, read: true } : item)),
      )
    },
  })
}

export { useMarkNotificationsReadMutation, useNotificationsQuery }
