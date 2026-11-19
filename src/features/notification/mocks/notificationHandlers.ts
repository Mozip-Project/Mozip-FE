import { HttpResponse } from 'msw'
import type {
  MarkNotificationsReadMutation,
  MarkNotificationsReadMutationVariables,
  NotificationsQuery,
  NotificationsQueryVariables,
} from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'

type NotificationItems = NotificationsQuery['notifications']['items']

const MINUTE_MS = 60 * 1000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

function timeAgo(elapsedMs: number) {
  return new Date(Date.now() - elapsedMs).toISOString()
}

// TODO: 대표자 3종 외 제목은 명세 설명 기준 임시 문구, 이동 경로 확정 후 link 교체
function createNotificationItems(): NotificationItems {
  return [
    {
      id: '1',
      type: 'TRANSFER_REQUEST',
      title: '대표자 요청이 도착했어요',
      link: '/manage/organization/members',
      read: false,
      createdAt: timeAgo(0),
      organization: { name: 'UXUX' },
    },
    {
      id: '2',
      type: 'DOC_RESULT',
      title: '서류 결과가 도착했어요',
      link: '/applications',
      read: false,
      createdAt: timeAgo(5 * MINUTE_MS),
      organization: { name: '밴드 소리샘' },
    },
    {
      id: '3',
      type: 'TRANSFER_APPROVED',
      title: '대표자 신청이 승인되었어요',
      link: '/manage/organization/members',
      read: false,
      createdAt: timeAgo(30 * MINUTE_MS),
      organization: { name: 'UXUX' },
    },
    {
      id: '4',
      type: 'INTERVIEW_RESELECT',
      title: '면접 가능 시간을 다시 선택해 주세요',
      link: '/applications',
      read: false,
      createdAt: timeAgo(HOUR_MS),
      organization: { name: '멋쟁이개발자' },
    },
    {
      id: '5',
      type: 'TRANSFER_REJECTED',
      title: '대표자 신청이 거절되었어요',
      link: '/manage/organization/members',
      read: false,
      createdAt: timeAgo(3 * HOUR_MS),
      organization: { name: '멋쟁이개발자' },
    },
    {
      id: '6',
      type: 'EVALUATION_REQUEST',
      title: '서류 평가자로 지정되었어요',
      link: '/manage/recruitments',
      read: true,
      createdAt: timeAgo(DAY_MS),
      organization: { name: 'UXUX' },
    },
    {
      id: '7',
      type: 'POSTING_NOTICE',
      title: '지원한 공고에 새 공지가 올라왔어요',
      link: '/applications',
      read: true,
      createdAt: timeAgo(2 * DAY_MS),
      organization: { name: '밴드 소리샘' },
    },
    {
      id: '8',
      type: 'EVALUATION_DEADLINE',
      title: '서류 평가 마감이 다가오고 있어요',
      link: '/manage/recruitments',
      read: true,
      createdAt: timeAgo(3 * DAY_MS),
      organization: { name: 'UXUX' },
    },
    {
      id: '9',
      type: 'SCRAP_OPEN',
      title: '스크랩한 공고의 모집이 시작됐어요',
      link: '/postings',
      read: true,
      createdAt: timeAgo(7 * DAY_MS),
      organization: { name: '멋쟁이개발자' },
    },
    {
      id: '10',
      type: 'INVITATION',
      title: '운영진으로 초대받았어요',
      link: '/manage/organization',
      read: true,
      createdAt: timeAgo(14 * DAY_MS),
      organization: { name: '밴드 소리샘' },
    },
    {
      id: '11',
      type: 'FINAL_RESULT',
      title: '최종 결과가 도착했어요',
      link: '/applications',
      read: true,
      createdAt: timeAgo(29 * DAY_MS),
      organization: { name: 'UXUX' },
    },
  ]
}

let notificationItems = createNotificationItems()

// 테스트 사이 읽음 상태가 이어지지 않도록 초기화
function resetNotificationItems() {
  notificationItems = createNotificationItems()
}

function toIdList(ids: MarkNotificationsReadMutationVariables['ids']) {
  if (ids == null) {
    return null
  }
  return [ids].flat().map(String)
}

const notificationHandlers = [
  graphqlApi.query<NotificationsQuery, NotificationsQueryVariables>('Notifications', () =>
    HttpResponse.json({
      data: {
        notifications: { items: notificationItems },
      },
    }),
  ),

  // ids 없으면 전체 읽음
  graphqlApi.mutation<MarkNotificationsReadMutation, MarkNotificationsReadMutationVariables>(
    'MarkNotificationsRead',
    ({ variables }) => {
      const ids = toIdList(variables.ids)
      notificationItems = notificationItems.map((item) =>
        ids === null || ids.includes(item.id) ? { ...item, read: true } : item,
      )
      return HttpResponse.json({ data: { markNotificationsRead: true } })
    },
  ),
]

export { notificationHandlers, resetNotificationItems }
