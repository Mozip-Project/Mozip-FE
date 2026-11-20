import {
  useMarkNotificationsReadMutation,
  useNotificationsInfiniteQuery,
  useNotificationUnreadCountQuery,
} from '@/features/notification/api/queries'
import type { NotificationEntry } from '@/features/notification/types'
import type { NotificationTab } from '@/gql/graphql'

function useNotificationPanel(tab: NotificationTab | undefined) {
  const {
    data: notifications,
    isError,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
  } = useNotificationsInfiniteQuery(tab)
  const { data: unreadCount } = useNotificationUnreadCountQuery()
  const { mutate: markNotificationsRead } = useMarkNotificationsReadMutation()

  // 다시 조회에 실패해도 이전 목록은 유지되므로 목록이 없을 때만 오류 표시
  const isLoading = notifications === undefined && !isError
  const hasLoadError = notifications === undefined && isError
  // 다음 페이지가 실패하면 끝이 계속 보여도 자동 요청 중단, 다시 열거나 다시 조회가 성공하면 재개
  const canLoadMore =
    notifications !== undefined && hasNextPage && !isFetchingNextPage && !isFetchNextPageError

  function loadMore() {
    if (canLoadMore) {
      void fetchNextPage()
    }
  }

  function markAsRead({ id, isRead }: NotificationEntry) {
    if (!isRead) {
      markNotificationsRead([id])
    }
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    hasLoadError,
    canLoadMore,
    isLoadingMore: isFetchingNextPage,
    loadMore,
    markAsRead,
  }
}

export { useNotificationPanel }
