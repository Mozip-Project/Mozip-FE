import { delay, HttpResponse } from 'msw'
import { getNotificationAudience } from '@/features/notification/utils/notificationEntry'
import type { NotificationPage } from '@/features/notification/utils/notificationPage'
import type {
  MarkNotificationsReadMutation,
  MarkNotificationsReadMutationVariables,
  NotificationsQuery,
  NotificationsQueryVariables,
  NotificationUnreadCountQuery,
  NotificationUnreadCountQueryVariables,
} from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { MOCK_RESPONSE_DELAY_MS } from '@/mocks/responseDelay'

type NotificationItems = NotificationPage

// 서버 기본 size, 지난 알림은 무한스크롤 확인용으로 기본 목록을 주 단위로 반복
const DEFAULT_PAGE_SIZE = 20
// userHandlers의 샘플 회원과 같은 id
const MOCK_USER_ID = 'user-1'
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
      linkUrl: '/',
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

function filterByRole(items: NotificationItems, role: NotificationsQueryVariables['role']) {
  if (role == null) {
    return items
  }
  const audience = role === 'APPLICANT' ? 'applicant' : 'organizer'
  return items.filter((item) => getNotificationAudience(item.type) === audience)
}

const notificationHandlers = [
  // role 생략 시 전체 응답, page는 0부터
  graphqlApi.query<NotificationsQuery, NotificationsQueryVariables>(
    'Notifications',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const roleItems = filterByRole(notificationItems, variables.role)
      const size = variables.size ?? DEFAULT_PAGE_SIZE
      const start = (variables.page ?? 0) * size

      return HttpResponse.json({ data: { notifications: roleItems.slice(start, start + size) } })
    },
  ),

  graphqlApi.query<NotificationUnreadCountQuery, NotificationUnreadCountQueryVariables>(
    'NotificationUnreadCount',
    async () => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const unreadNotificationCount = notificationItems.filter((item) => !item.isRead).length

      return HttpResponse.json({ data: { me: { id: MOCK_USER_ID, unreadNotificationCount } } })
    },
  ),

  graphqlApi.mutation<MarkNotificationsReadMutation, MarkNotificationsReadMutationVariables>(
    'MarkNotificationsRead',
    ({ variables }) => {
      const ids = [variables.ids].flat().map(String)
      notificationItems = notificationItems.map((item) =>
        ids.includes(item.id) ? { ...item, isRead: true } : item,
      )
      return HttpResponse.json({ data: { markNotificationsRead: true } })
    },
  ),
]

export { notificationHandlers, resetNotificationItems }
