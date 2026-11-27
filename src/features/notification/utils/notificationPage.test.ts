import { describe, expect, it } from 'vitest'
import {
  countNewlyRead,
  flattenNotificationPages,
  getNextNotificationPage,
  markNotificationPagesRead,
  type NotificationPage,
} from './notificationPage'

type NotificationItem = NotificationPage[number]

const PAGE_SIZE = 2

function createItem(overrides: Partial<NotificationItem>): NotificationItem {
  return {
    id: '1',
    type: 'DOC_RESULT',
    title: '서류 결과가 나왔어요',
    linkUrl: null,
    isRead: false,
    createdAt: new Date(2026, 10, 20).toISOString(),
    organization: null,
    ...overrides,
  }
}

function createData() {
  return {
    pages: [
      [
        createItem({ id: 'applicant-unread', type: 'DOC_RESULT' }),
        createItem({ id: 'applicant-read', type: 'FINAL_RESULT', isRead: true }),
      ],
      [createItem({ id: 'operator-unread', type: 'TRANSFER_REQUEST' })],
    ],
    pageParams: [0, 1],
  }
}

describe('flattenNotificationPages', () => {
  it('페이지 순서대로 합치고 다음 페이지에 다시 온 알림은 뺀다', () => {
    const pages = [
      [createItem({ id: 'a' }), createItem({ id: 'b' })],
      [createItem({ id: 'b' }), createItem({ id: 'c' })],
    ]

    expect(flattenNotificationPages(pages).map(({ id }) => id)).toEqual(['a', 'b', 'c'])
  })
})

describe('getNextNotificationPage', () => {
  it('요청한 크기만큼 꽉 차서 오면 다음 페이지 번호를 돌려준다', () => {
    const fullPage = [createItem({ id: 'a' }), createItem({ id: 'b' })]

    expect(getNextNotificationPage(fullPage, [fullPage], PAGE_SIZE)).toBe(1)
  })

  it('요청한 크기보다 적게 오거나 빈 페이지가 오면 멈춘다', () => {
    const fullPage = [createItem({ id: 'a' }), createItem({ id: 'b' })]
    const shortPage = [createItem({ id: 'c' })]

    expect(getNextNotificationPage(shortPage, [fullPage, shortPage], PAGE_SIZE)).toBeUndefined()
    expect(getNextNotificationPage([], [fullPage, []], PAGE_SIZE)).toBeUndefined()
  })
})

describe('countNewlyRead', () => {
  it('지원자·운영진 알림을 함께 읽으면 합쳐서 센다', () => {
    expect(countNewlyRead([createData()], ['applicant-unread', 'operator-unread'])).toBe(2)
  })

  it('여러 탭 캐시에 같은 알림이 있어도 한 번만 센다', () => {
    const operatorTab = {
      pages: [[createItem({ id: 'operator-unread', type: 'TRANSFER_REQUEST' })]],
    }

    expect(countNewlyRead([createData(), operatorTab], ['operator-unread'])).toBe(1)
  })

  it('이미 읽은 알림이나 어느 캐시에도 없는 id는 세지 않는다', () => {
    expect(countNewlyRead([createData()], ['applicant-read', 'unknown'])).toBe(0)
  })
})

describe('markNotificationPagesRead', () => {
  it('다른 페이지에 있는 알림도 읽음 표시하고 페이지 구성은 유지한다', () => {
    const data = markNotificationPagesRead(createData(), ['operator-unread'])

    expect(data.pages[1]?.[0]?.isRead).toBe(true)
    expect(data.pages[0]?.map(({ isRead }) => isRead)).toEqual([false, true])
    expect(data.pageParams).toEqual([0, 1])
  })

  it('불러온 목록에 읽지 않은 대상이 없으면 그대로 돌려준다', () => {
    const before = createData()

    expect(markNotificationPagesRead(before, ['applicant-read', 'unknown'])).toBe(before)
  })
})
