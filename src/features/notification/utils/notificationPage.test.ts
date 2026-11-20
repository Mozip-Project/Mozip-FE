import { describe, expect, it } from 'vitest'
import {
  countNewlyRead,
  decreaseUnreadCount,
  flattenNotificationPages,
  getNextNotificationPage,
  markNotificationPagesRead,
  type NotificationPage,
} from './notificationPage'

type NotificationItem = NotificationPage['content'][number]

const UNREAD_COUNT = { all: 5, operator: 3, applicant: 2 }

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

function createPage(content: NotificationItem[], totalCount = 3): NotificationPage {
  return { content, totalCount }
}

function createData() {
  return {
    pages: [
      createPage([
        createItem({ id: 'applicant-unread', type: 'DOC_RESULT' }),
        createItem({ id: 'applicant-read', type: 'FINAL_RESULT', isRead: true }),
      ]),
      createPage([createItem({ id: 'operator-unread', type: 'TRANSFER_REQUEST' })]),
    ],
    pageParams: [0, 1],
  }
}

describe('flattenNotificationPages', () => {
  it('페이지 순서대로 합치고 다음 페이지에 다시 온 알림은 뺀다', () => {
    const pages = [
      createPage([createItem({ id: 'a' }), createItem({ id: 'b' })]),
      createPage([createItem({ id: 'b' }), createItem({ id: 'c' })]),
    ]

    expect(flattenNotificationPages(pages).map(({ id }) => id)).toEqual(['a', 'b', 'c'])
  })
})

describe('getNextNotificationPage', () => {
  it('불러온 수가 전체보다 적으면 다음 페이지 번호를 돌려준다', () => {
    const lastPage = createPage([createItem({ id: 'a' })], 2)

    expect(getNextNotificationPage(lastPage, [lastPage])).toBe(1)
  })

  it('전체를 다 불러왔거나 빈 페이지가 오면 멈춘다', () => {
    const fullPage = createPage([createItem({ id: 'a' })], 1)
    const emptyPage = createPage([], 5)

    expect(getNextNotificationPage(fullPage, [fullPage])).toBeUndefined()
    expect(
      getNextNotificationPage(emptyPage, [createPage([createItem({ id: 'a' })], 5), emptyPage]),
    ).toBeUndefined()
  })
})

describe('countNewlyRead', () => {
  it('지원자·운영진 알림을 함께 읽으면 각 탭 숫자를 따로 센다', () => {
    expect(countNewlyRead([createData()], ['applicant-unread', 'operator-unread'])).toEqual({
      all: 2,
      operator: 1,
      applicant: 1,
    })
  })

  it('여러 탭 캐시에 같은 알림이 있어도 한 번만 센다', () => {
    const operatorTab = {
      pages: [createPage([createItem({ id: 'operator-unread', type: 'TRANSFER_REQUEST' })])],
    }

    expect(countNewlyRead([createData(), operatorTab], ['operator-unread'])).toEqual({
      all: 1,
      operator: 1,
      applicant: 0,
    })
  })

  it('이미 읽은 알림이나 어느 캐시에도 없는 id는 세지 않는다', () => {
    expect(countNewlyRead([createData()], ['applicant-read', 'unknown'])).toEqual({
      all: 0,
      operator: 0,
      applicant: 0,
    })
  })
})

describe('markNotificationPagesRead', () => {
  it('다른 페이지에 있는 알림도 읽음 표시하고 페이지 구성은 유지한다', () => {
    const data = markNotificationPagesRead(createData(), ['operator-unread'])

    expect(data.pages[1]?.content[0]?.isRead).toBe(true)
    expect(data.pages[0]?.content.map(({ isRead }) => isRead)).toEqual([false, true])
    expect(data.pageParams).toEqual([0, 1])
  })

  it('불러온 목록에 읽지 않은 대상이 없으면 그대로 돌려준다', () => {
    const before = createData()

    expect(markNotificationPagesRead(before, ['applicant-read', 'unknown'])).toBe(before)
  })
})

describe('decreaseUnreadCount', () => {
  it('탭별 배지 숫자를 줄이고 0 아래로는 내리지 않는다', () => {
    expect(decreaseUnreadCount(UNREAD_COUNT, { all: 1, operator: 1, applicant: 0 })).toEqual({
      all: 4,
      operator: 2,
      applicant: 2,
    })
    expect(
      decreaseUnreadCount(
        { all: 1, operator: 0, applicant: 1 },
        { all: 2, operator: 1, applicant: 1 },
      ),
    ).toEqual({ all: 0, operator: 0, applicant: 0 })
  })
})
