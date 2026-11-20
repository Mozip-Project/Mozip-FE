import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query'
import { toNotificationEntries } from '@/features/notification/utils/notificationEntry'
import {
  countNewlyRead,
  decreaseUnreadCount,
  flattenNotificationPages,
  getNextNotificationPage,
  markNotificationPagesRead,
  type NotificationPage,
  type UnreadCount,
} from '@/features/notification/utils/notificationPage'
import type { NotificationTab } from '@/gql/graphql'
import { getNotifications, getNotificationUnreadCount, markNotificationsRead } from './api'
import { notificationKeys } from './keys'

const FIRST_PAGE = 0

type NotificationListData = InfiniteData<NotificationPage, number>

// 패널을 열 때마다 새로 조회하도록 staleTime 0
function useNotificationsInfiniteQuery(tab: NotificationTab | undefined) {
  return useInfiniteQuery({
    queryKey: notificationKeys.list(tab),
    queryFn: ({ pageParam }) => getNotifications(tab, pageParam),
    initialPageParam: FIRST_PAGE,
    getNextPageParam: getNextNotificationPage,
    select: (data) => toNotificationEntries(flattenNotificationPages(data.pages), new Date()),
    staleTime: 0,
  })
}

function useNotificationUnreadCountQuery() {
  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: getNotificationUnreadCount,
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
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })
      const listQueryKey = notificationKeys.lists()
      const cachedLists = queryClient
        .getQueriesData<NotificationListData>({ queryKey: listQueryKey })
        .flatMap(([, data]) => (data ? [data] : []))
      const decrease = countNewlyRead(cachedLists, ids)

      queryClient.setQueriesData<NotificationListData>(
        { queryKey: listQueryKey },
        (data) => data && markNotificationPagesRead(data, ids),
      )
      queryClient.setQueryData<UnreadCount>(
        notificationKeys.unreadCount,
        (count) => count && decreaseUnreadCount(count, decrease),
      )
      await queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export {
  useMarkNotificationsReadMutation,
  useNotificationsInfiniteQuery,
  useNotificationUnreadCountQuery,
}
