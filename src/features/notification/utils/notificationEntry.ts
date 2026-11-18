import type { NotificationEntry } from '@/features/notification/types'
import type { NotificationsQuery, NotificationType } from '@/gql/graphql'
import { formatRelativeTime } from '@/utils/date'
import type { Route } from 'next'

type NotificationItems = NotificationsQuery['notifications']['items']

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

// 외부 주소와 //, /\로 시작하는 다른 출처 주소 제외
const INTERNAL_PATH_PATTERN = /^\/(?![/\\])/

function isInternalPath(link: string | null): link is Route {
  return link !== null && INTERNAL_PATH_PATTERN.test(link)
}

function toNotificationEntries(items: NotificationItems, now: Date): NotificationEntry[] {
  return items.map((item) => ({
    id: item.id,
    audience: AUDIENCE_BY_TYPE[item.type],
    href: isInternalPath(item.link) ? item.link : null,
    isRead: item.read,
    source: item.organization?.name ?? null,
    title: item.title,
    meta: formatRelativeTime(new Date(item.createdAt), now),
  }))
}

export { toNotificationEntries }
