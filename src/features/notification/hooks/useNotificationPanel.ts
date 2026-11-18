import {
  useMarkNotificationsReadMutation,
  useNotificationsQuery,
} from '@/features/notification/api/queries'
import type { NotificationEntry } from '@/features/notification/types'

function useNotificationPanel() {
  const { data: notifications, isError } = useNotificationsQuery()
  const { mutate: markNotificationsRead } = useMarkNotificationsReadMutation()

  // 다시 조회에 실패해도 이전 목록은 유지되므로 목록이 없을 때만 오류 표시
  const isLoading = notifications === undefined && !isError
  const hasLoadError = notifications === undefined && isError

  function markAsRead({ id, isRead }: NotificationEntry) {
    if (!isRead) {
      markNotificationsRead([id])
    }
  }

  return { notifications, isLoading, hasLoadError, markAsRead }
}

export { useNotificationPanel }
