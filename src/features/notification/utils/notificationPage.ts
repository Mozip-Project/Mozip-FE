import type { NotificationsQuery } from '@/gql/graphql'

type NotificationPage = NotificationsQuery['notifications']
type NotificationItem = NotificationPage[number]

// 페이지를 나눠 받는 사이 새 알림이 오면 다음 페이지에 같은 알림이 다시 올 수 있어 중복 제거
function flattenNotificationPages(pages: readonly NotificationPage[]): NotificationItem[] {
  const seenIds = new Set<string>()

  return pages.flat().filter((item) => {
    if (seenIds.has(item.id)) {
      return false
    }
    seenIds.add(item.id)
    return true
  })
}

// 서버에 전체 개수가 없어 받은 개수가 요청한 크기보다 적으면 마지막 페이지
function getNextNotificationPage(
  lastPage: NotificationPage,
  pages: readonly NotificationPage[],
  pageSize: number,
) {
  if (lastPage.length < pageSize) {
    return undefined
  }
  return pages.length
}

type NotificationList = { pages: NotificationPage[] }

// 같은 알림이 여러 탭 캐시에 있어도 한 번씩만 세어 배지 숫자에서 줄일 개수 계산
function countNewlyRead(lists: readonly NotificationList[], ids: string[]) {
  const newlyReadIds = new Set(
    lists
      .flatMap((list) => list.pages.flat())
      .filter((item) => !item.isRead && ids.includes(item.id))
      .map((item) => item.id),
  )

  return newlyReadIds.size
}

// 다시 조회가 끝나기 전까지 읽음 표시가 되돌아가지 않도록 불러온 모든 페이지에 반영
function markNotificationPagesRead<TData extends NotificationList>(
  data: TData,
  ids: string[],
): TData {
  const hasUnreadTarget = data.pages.some((page) =>
    page.some((item) => !item.isRead && ids.includes(item.id)),
  )

  if (!hasUnreadTarget) {
    return data
  }

  return {
    ...data,
    pages: data.pages.map((page) =>
      page.map((item) => (ids.includes(item.id) ? { ...item, isRead: true } : item)),
    ),
  }
}

export {
  countNewlyRead,
  flattenNotificationPages,
  getNextNotificationPage,
  markNotificationPagesRead,
}
export type { NotificationPage }
