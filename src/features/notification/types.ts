import type { Route } from 'next'

type NotificationAudience = 'organizer' | 'applicant'

type NotificationEntry = {
  id: string
  audience: NotificationAudience
  href: Route | null
  isRead: boolean
  source: string | null
  title: string
  meta: string
}

export type { NotificationAudience, NotificationEntry }
