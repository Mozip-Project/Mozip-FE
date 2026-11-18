import { describe, expect, it } from 'vitest'
import type { NotificationsQuery } from '@/gql/graphql'
import { toNotificationEntries } from './notificationEntry'

type NotificationItem = NotificationsQuery['notifications']['items'][number]

const NOW = new Date(2026, 10, 17, 10, 0)

function createItem(overrides: Partial<NotificationItem> = {}): NotificationItem {
  return {
    id: '1',
    type: 'DOC_RESULT',
    title: '서류 결과가 나왔어요',
    link: '/postings',
    read: false,
    createdAt: new Date(2026, 10, 17, 9, 0).toISOString(),
    organization: { name: '테스트 동아리' },
    ...overrides,
  }
}

describe('toNotificationEntries', () => {
  it('서버 알림을 패널 항목으로 바꾼다', () => {
    expect(toNotificationEntries([createItem()], NOW)).toEqual([
      {
        id: '1',
        audience: 'applicant',
        href: '/postings',
        isRead: false,
        source: '테스트 동아리',
        title: '서류 결과가 나왔어요',
        meta: '1시간 전',
      },
    ])
  })

  it('알림 type으로 운영진·지원자를 나눈다', () => {
    const [applicant, organizer] = toNotificationEntries(
      [createItem({ type: 'SCRAP_OPEN' }), createItem({ type: 'TRANSFER_REQUEST' })],
      NOW,
    )

    expect(applicant?.audience).toBe('applicant')
    expect(organizer?.audience).toBe('organizer')
  })

  it('앱 안 경로가 아닌 link는 이동하지 않는다', () => {
    const links = [null, '', 'manage', 'https://example.com', '//example.com', '/\\example.com']
    const entries = toNotificationEntries(
      links.map((link) => createItem({ link })),
      NOW,
    )

    expect(entries.map(({ href }) => href)).toEqual(links.map(() => null))
  })

  it('단체가 없으면 출처를 비운다', () => {
    const [entry] = toNotificationEntries([createItem({ organization: null })], NOW)

    expect(entry?.source).toBeNull()
  })
})
