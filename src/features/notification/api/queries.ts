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
    onSuccess: async (isMarked, ids) => {
      if (!isMarked) {
        return
      }
      // 읽음 전 상태를 담은 진행 중 조회가 갱신한 캐시를 덮어쓰지 않도록 취소
      await queryClient.cancelQueries({ queryKey: notificationKeys.list })
      queryClient.setQueryData<NotificationItems>(notificationKeys.list, (items) =>
        items?.map((item) => (ids.includes(item.id) ? { ...item, read: true } : item)),
      )
      await queryClient.invalidateQueries({ queryKey: notificationKeys.list })
    },
  })
}

export { useMarkNotificationsReadMutation, useNotificationsQuery }
