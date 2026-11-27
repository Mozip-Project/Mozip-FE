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
  flattenNotificationPages,
  getNextNotificationPage,
  markNotificationPagesRead,
  type NotificationPage,
} from '@/features/notification/utils/notificationPage'
import type { Role } from '@/gql/graphql'
import {
  getNotifications,
  getNotificationUnreadCount,
  markNotificationsRead,
  NOTIFICATION_PAGE_SIZE,
} from './api'
import { notificationKeys } from './keys'

const FIRST_PAGE = 0

type NotificationListData = InfiniteData<NotificationPage, number>

// 패널을 열 때마다 새로 조회하도록 staleTime 0
function useNotificationsInfiniteQuery(role: Role | undefined) {
  return useInfiniteQuery({
    queryKey: notificationKeys.list(role),
    queryFn: ({ pageParam }) => getNotifications(role, pageParam),
    initialPageParam: FIRST_PAGE,
    getNextPageParam: (lastPage, pages) =>
      getNextNotificationPage(lastPage, pages, NOTIFICATION_PAGE_SIZE),
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
      // 오래된 목록 캐시가 섞여도 0 아래로 내려가지 않게 처리
      queryClient.setQueryData<number>(notificationKeys.unreadCount, (count) =>
        count === undefined ? count : Math.max(0, count - decrease),
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
