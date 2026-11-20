import type { NotificationsQuery, NotificationUnreadCountQuery } from '@/gql/graphql'
import { getNotificationAudience } from './notificationEntry'

type NotificationPage = NotificationsQuery['notifications']
type NotificationItem = NotificationPage['content'][number]

// 페이지를 나눠 받는 사이 새 알림이 오면 다음 페이지에 같은 알림이 다시 올 수 있어 중복 제거
function flattenNotificationPages(pages: readonly NotificationPage[]): NotificationItem[] {
  const seenIds = new Set<string>()

  return pages
    .flatMap((page) => page.content)
    .filter((item) => {
      if (seenIds.has(item.id)) {
        return false
      }
      seenIds.add(item.id)
      return true
    })
}

// 불러온 알림 수가 전체보다 적을 때만 다음 페이지 번호
function getNextNotificationPage(lastPage: NotificationPage, pages: readonly NotificationPage[]) {
  const loadedCount = pages.reduce((count, page) => count + page.content.length, 0)

  if (lastPage.content.length === 0 || loadedCount >= lastPage.totalCount) {
    return undefined
  }
  return pages.length
}

type NotificationList = { pages: NotificationPage[] }
type UnreadCount = NotificationUnreadCountQuery['notifications']['unreadCount']

// 같은 알림이 여러 탭 캐시에 있어도 한 번씩만 세어 배지 숫자에서 줄일 개수 계산
function countNewlyRead(lists: readonly NotificationList[], ids: string[]): UnreadCount {
  const newlyReadById = new Map(
    lists
      .flatMap((list) => list.pages.flatMap((page) => page.content))
      .filter((item) => !item.isRead && ids.includes(item.id))
      .map((item) => [item.id, item]),
  )
  const newlyRead = [...newlyReadById.values()]
  const applicant = newlyRead.filter(
    (item) => getNotificationAudience(item.type) === 'applicant',
  ).length

  return { all: newlyRead.length, operator: newlyRead.length - applicant, applicant }
}

// 다시 조회가 끝나기 전까지 읽음 표시가 되돌아가지 않도록 불러온 모든 페이지에 반영
function markNotificationPagesRead<TData extends NotificationList>(
  data: TData,
  ids: string[],
): TData {
  const hasUnreadTarget = data.pages.some((page) =>
    page.content.some((item) => !item.isRead && ids.includes(item.id)),
  )

  if (!hasUnreadTarget) {
    return data
  }

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      content: page.content.map((item) =>
        ids.includes(item.id) ? { ...item, isRead: true } : item,
      ),
    })),
  }
}

// 다른 탭 목록을 다시 받기 전 오래된 캐시가 섞여도 0 아래로 내려가지 않게 처리
function decreaseUnreadCount(count: UnreadCount, decrease: UnreadCount): UnreadCount {
  return {
    all: Math.max(0, count.all - decrease.all),
    operator: Math.max(0, count.operator - decrease.operator),
    applicant: Math.max(0, count.applicant - decrease.applicant),
  }
}

export {
  countNewlyRead,
  decreaseUnreadCount,
  flattenNotificationPages,
  getNextNotificationPage,
  markNotificationPagesRead,
}
export type { NotificationPage, UnreadCount }
