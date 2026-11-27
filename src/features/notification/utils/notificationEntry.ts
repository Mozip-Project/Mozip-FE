import type { NotificationEntry } from '@/features/notification/types'
import type { NotificationsQuery, NotificationType } from '@/gql/graphql'
import { formatRelativeTime } from '@/utils/date'
import type { Route } from 'next'

type NotificationItems = NotificationsQuery['notifications']

const AUDIENCE_BY_TYPE = {
  POSTING_NOTICE: 'applicant',
  DOC_RESULT: 'applicant',
  FINAL_RESULT: 'applicant',
  INTERVIEW_RESELECT: 'applicant',
  SCRAP_OPEN: 'applicant',
  INVITATION: 'organizer',
  TRANSFER_REQUEST: 'organizer',
  TRANSFER_APPROVED: 'organizer',
  TRANSFER_REJECTED: 'organizer',
  EVALUATION_REQUEST: 'organizer',
  EVALUATION_DEADLINE: 'organizer',
} satisfies Record<NotificationType, NotificationEntry['audience']>

function getNotificationAudience(type: NotificationType) {
  return AUDIENCE_BY_TYPE[type]
}

// 외부 주소와 //, /\로 시작하는 다른 출처 주소 제외
const INTERNAL_PATH_PATTERN = /^\/(?![/\\])/
// 출처 비교용 기준 주소
const PARSE_BASE_URL = 'https://mozip.invalid'

// URL 파서가 탭·줄바꿈을 지워 다른 출처가 되는 주소도 제외
function isInternalPath(link: string | null): link is Route {
  if (link === null || !INTERNAL_PATH_PATTERN.test(link)) {
    return false
  }
  try {
    return new URL(link, PARSE_BASE_URL).origin === PARSE_BASE_URL
  } catch {
    return false
  }
}

function toNotificationEntries(items: NotificationItems, now: Date): NotificationEntry[] {
  return items.map((item) => ({
    id: item.id,
    audience: getNotificationAudience(item.type),
    href: isInternalPath(item.linkUrl) ? item.linkUrl : null,
    isRead: item.isRead,
    source: item.organization?.name ?? null,
    title: item.title,
    meta: formatRelativeTime(new Date(item.createdAt), now),
  }))
}

export { getNotificationAudience, toNotificationEntries }
