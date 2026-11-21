import { delay, HttpResponse } from 'msw'
import { getNotificationAudience } from '@/features/notification/utils/notificationEntry'
import type { NotificationPage, UnreadCount } from '@/features/notification/utils/notificationPage'
import type {
  MarkNotificationsReadMutation,
  MarkNotificationsReadMutationVariables,
  NotificationsQuery,
  NotificationsQueryVariables,
  NotificationUnreadCountQuery,
  NotificationUnreadCountQueryVariables,
} from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'

type NotificationItems = NotificationPage['content']

// 명세 기본 size, 지난 알림은 무한스크롤 확인용으로 기본 목록을 주 단위로 반복
const PAGE_SIZE = 20
// 스켈레톤은 300ms 뒤에 보여 개발 중 로딩 상태를 확인할 수 있게 응답 지연
const RESPONSE_DELAY_MS = process.env.NODE_ENV === 'test' ? 0 : 800
const OLDER_ITEM_ROUNDS = 2
const WEEK_DAYS = 7

const MINUTE_MS = 60 * 1000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

function timeAgo(elapsedMs: number) {
  return new Date(Date.now() - elapsedMs).toISOString()
}

// TODO: 대표자 3종 외 제목은 명세 설명 기준 임시 문구, 이동 경로 확정 후 linkUrl 교체
function createNotificationItems(): NotificationItems {
  return [
    {
      id: '1',
      type: 'TRANSFER_REQUEST',
      title: '대표자 요청이 도착했어요',
      linkUrl: '/manage/organization/members',
      isRead: false,
      createdAt: timeAgo(0),
      organization: { name: 'UXUX' },
    },
    {
      id: '2',
      type: 'DOC_RESULT',
      title: '서류 결과가 도착했어요',
      linkUrl: '/applications',
      isRead: false,
      createdAt: timeAgo(5 * MINUTE_MS),
      organization: { name: '밴드 소리샘' },
    },
    {
      id: '3',
      type: 'TRANSFER_APPROVED',
      title: '대표자 신청이 승인되었어요',
      linkUrl: '/manage/organization/members',
      isRead: false,
      createdAt: timeAgo(30 * MINUTE_MS),
      organization: { name: 'UXUX' },
    },
    {
      id: '4',
      type: 'INTERVIEW_RESELECT',
      title: '면접 가능 시간을 다시 선택해 주세요',
      linkUrl: '/applications',
      isRead: false,
      createdAt: timeAgo(HOUR_MS),
      organization: { name: '멋쟁이개발자' },
    },
    {
      id: '5',
      type: 'TRANSFER_REJECTED',
      title: '대표자 신청이 거절되었어요',
      linkUrl: '/manage/organization/members',
      isRead: false,
      createdAt: timeAgo(3 * HOUR_MS),
      organization: { name: '멋쟁이개발자' },
    },
    {
      id: '6',
      type: 'EVALUATION_REQUEST',
      title: '서류 평가자로 지정되었어요',
      linkUrl: '/manage/recruitments',
      isRead: true,
      createdAt: timeAgo(DAY_MS),
      organization: { name: 'UXUX' },
    },
    {
      id: '7',
      type: 'POSTING_NOTICE',
      title: '지원한 공고에 새 공지가 올라왔어요',
      linkUrl: '/applications',
      isRead: true,
      createdAt: timeAgo(2 * DAY_MS),
      organization: { name: '밴드 소리샘' },
    },
    {
      id: '8',
      type: 'EVALUATION_DEADLINE',
      title: '서류 평가 마감이 다가오고 있어요',
      linkUrl: '/manage/recruitments',
      isRead: true,
      createdAt: timeAgo(3 * DAY_MS),
      organization: { name: 'UXUX' },
    },
    {
      id: '9',
      type: 'SCRAP_OPEN',
      title: '스크랩한 공고의 모집이 시작됐어요',
      linkUrl: '/postings',
      isRead: true,
      createdAt: timeAgo(7 * DAY_MS),
      organization: { name: '멋쟁이개발자' },
    },
    {
      id: '10',
      type: 'INVITATION',
      title: '운영진으로 초대받았어요',
      linkUrl: '/manage/organization',
      isRead: true,
      createdAt: timeAgo(14 * DAY_MS),
      organization: { name: '밴드 소리샘' },
    },
    {
      id: '11',
      type: 'FINAL_RESULT',
      title: '최종 결과가 도착했어요',
      linkUrl: '/applications',
      isRead: true,
      createdAt: timeAgo(29 * DAY_MS),
      organization: { name: 'UXUX' },
    },
  ]
}

function createAllNotificationItems(): NotificationItems {
  const recentItems = createNotificationItems()
  const olderItems = Array.from({ length: OLDER_ITEM_ROUNDS }, (_, index) => index + 1).flatMap(
    (round) =>
      recentItems.map((item, index) => ({
        ...item,
        id: `${item.id}-${round}`,
        isRead: true,
        createdAt: timeAgo(round * WEEK_DAYS * DAY_MS + index * HOUR_MS),
      })),
  )
  return [...recentItems, ...olderItems]
}

let notificationItems = createAllNotificationItems()

// 테스트 사이 읽음 상태가 이어지지 않도록 초기화
function resetNotificationItems() {
  notificationItems = createAllNotificationItems()
}

function filterByTab(items: NotificationItems, tab: NotificationsQueryVariables['tab']) {
  if (tab == null) {
    return items
  }
  const audience = tab === 'APPLICANT' ? 'applicant' : 'organizer'
  return items.filter((item) => getNotificationAudience(item.type) === audience)
}

function countUnread(items: NotificationItems): UnreadCount {
  const unreadItems = items.filter((item) => !item.isRead)
  const applicant = unreadItems.filter(
    (item) => getNotificationAudience(item.type) === 'applicant',
  ).length

  return { all: unreadItems.length, operator: unreadItems.length - applicant, applicant }
}

function toIdList(ids: MarkNotificationsReadMutationVariables['ids']) {
  if (ids == null) {
    return null
  }
  return [ids].flat().map(String)
}

const notificationHandlers = [
  // tab 생략 시 전체 탭, page는 0부터
  graphqlApi.query<NotificationsQuery, NotificationsQueryVariables>(
    'Notifications',
    async ({ variables }) => {
      await delay(RESPONSE_DELAY_MS)
      const tabItems = filterByTab(notificationItems, variables.tab)
      const start = (variables.page ?? 0) * PAGE_SIZE

      return HttpResponse.json({
        data: {
          notifications: {
            content: tabItems.slice(start, start + PAGE_SIZE),
            totalCount: tabItems.length,
          },
        },
      })
    },
  ),

  graphqlApi.query<NotificationUnreadCountQuery, NotificationUnreadCountQueryVariables>(
    'NotificationUnreadCount',
    async () => {
      await delay(RESPONSE_DELAY_MS)
      return HttpResponse.json({
        data: { notifications: { unreadCount: countUnread(notificationItems) } },
      })
    },
  ),

  // ids 없으면 전체 읽음
  graphqlApi.mutation<MarkNotificationsReadMutation, MarkNotificationsReadMutationVariables>(
    'MarkNotificationsRead',
    ({ variables }) => {
      const ids = toIdList(variables.ids)
      notificationItems = notificationItems.map((item) =>
        ids === null || ids.includes(item.id) ? { ...item, isRead: true } : item,
      )
      return HttpResponse.json({ data: { markNotificationsRead: true } })
    },
  ),
]

export { notificationHandlers, resetNotificationItems }
