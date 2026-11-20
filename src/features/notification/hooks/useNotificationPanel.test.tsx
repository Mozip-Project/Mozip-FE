import { QueryClient, QueryClientProvider, type InfiniteData } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { notificationKeys } from '@/features/notification/api/keys'
import { resetNotificationItems } from '@/features/notification/mocks/notificationHandlers'
import type { NotificationPage } from '@/features/notification/utils/notificationPage'
import type {
  MarkNotificationsReadMutation,
  MarkNotificationsReadMutationVariables,
  NotificationsQuery,
  NotificationsQueryVariables,
  NotificationTab,
} from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { server } from '@/mocks/server'
import { useNotificationPanel } from './useNotificationPanel'
import type { ReactNode } from 'react'

type NotificationListData = InfiniteData<NotificationPage, number>

const ALL_TAB_KEY = notificationKeys.list(undefined)

function createTestQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

// 패널을 다시 열면 hook이 같은 queryClient로 다시 마운트됨
function renderNotificationPanelHook(
  queryClient = createTestQueryClient(),
  tab: NotificationTab | undefined = undefined,
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  const { result, rerender, unmount } = renderHook(
    (props: { tab: NotificationTab | undefined }) => useNotificationPanel(props.tab),
    { wrapper: Wrapper, initialProps: { tab } },
  )
  return { result, rerender, unmount, queryClient }
}

// 조회 요청 횟수 확인용
function countNotificationsRequests() {
  let count = 0
  server.use(
    graphqlApi.query('Notifications', () => {
      count += 1
      return HttpResponse.json({
        data: {
          notifications: { content: [], totalCount: 0 },
        },
      })
    }),
  )
  return () => count
}

function failNotificationsQuery() {
  server.use(
    graphqlApi.query('Notifications', () =>
      HttpResponse.json({
        errors: [{ message: '서버 오류', extensions: { code: 'COMMON_500' } }],
        data: null,
      }),
    ),
  )
}

// 첫 페이지는 기본 handler로 처리하고 다음 페이지부터 실패
function failNextPages() {
  server.use(
    graphqlApi.query<NotificationsQuery, NotificationsQueryVariables>(
      'Notifications',
      ({ variables }) => {
        if (!variables.page) {
          return undefined
        }
        return HttpResponse.json({
          errors: [{ message: '서버 오류', extensions: { code: 'COMMON_500' } }],
          data: null,
        })
      },
    ),
  )
}

// 다음 조회 한 번만 release 전까지 응답을 미루고, 그 뒤 조회는 기본 handler로 처리
function delayNextNotificationsResponse(stalePage: NotificationPage) {
  let releaseResponse = () => {}
  const released = new Promise<void>((resolve) => {
    releaseResponse = resolve
  })
  let hasReceivedRequest = false
  let hasSentResponse = false

  server.use(
    graphqlApi.query(
      'Notifications',
      async () => {
        hasReceivedRequest = true
        await released
        hasSentResponse = true
        return HttpResponse.json({ data: { notifications: stalePage } })
      },
      { once: true },
    ),
  )

  return {
    releaseResponse,
    hasReceivedRequest: () => hasReceivedRequest,
    hasSentResponse: () => hasSentResponse,
  }
}

// 읽음 처리 요청의 ids 기록용, 응답 없이 기본 handler로 넘겨 서버 상태 갱신
function recordMarkReadRequests() {
  const requestedIds: MarkNotificationsReadMutationVariables['ids'][] = []
  server.use(
    graphqlApi.mutation<MarkNotificationsReadMutation, MarkNotificationsReadMutationVariables>(
      'MarkNotificationsRead',
      ({ variables }) => {
        requestedIds.push(variables.ids)
      },
    ),
  )
  return requestedIds
}

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
})

afterEach(() => {
  resetNotificationItems()
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('useNotificationPanel', () => {
  it('패널을 열 때마다 다시 조회한다', async () => {
    const getRequestCount = countNotificationsRequests()
    const firstOpen = renderNotificationPanelHook()
    await waitFor(() => expect(firstOpen.result.current.notifications).toBeDefined())
    firstOpen.unmount()

    const secondOpen = renderNotificationPanelHook(firstOpen.queryClient)

    expect(secondOpen.result.current.notifications).toBeDefined()
    await waitFor(() => expect(getRequestCount()).toBe(2))
  })

  it('목록을 받기 전에는 로딩, 받은 뒤에는 목록을 돌려준다', async () => {
    const { result } = renderNotificationPanelHook()

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.notifications).toBeDefined())
    expect(result.current.isLoading).toBe(false)
    expect(result.current.hasLoadError).toBe(false)
  })

  it('처음 조회에 실패하면 오류 상태가 된다', async () => {
    failNotificationsQuery()
    const { result } = renderNotificationPanelHook()

    await waitFor(() => expect(result.current.hasLoadError).toBe(true))
    expect(result.current.isLoading).toBe(false)
  })

  it('패널을 다시 열 때 조회에 실패해도 이전 목록을 유지한다', async () => {
    const firstOpen = renderNotificationPanelHook()
    await waitFor(() => expect(firstOpen.result.current.notifications).toBeDefined())
    const notificationsBeforeFail = firstOpen.result.current.notifications
    firstOpen.unmount()

    failNotificationsQuery()
    const { result, queryClient } = renderNotificationPanelHook(firstOpen.queryClient)

    await waitFor(() => expect(queryClient.getQueryState(ALL_TAB_KEY)?.status).toBe('error'))
    expect(result.current.notifications).toEqual(notificationsBeforeFail)
    expect(result.current.hasLoadError).toBe(false)
  })

  it('읽지 않은 알림만 읽음 처리 요청을 보낸다', async () => {
    const markReadRequests = recordMarkReadRequests()
    const { result } = renderNotificationPanelHook()
    await waitFor(() => {
      expect(result.current.notifications).toBeDefined()
      expect(result.current.unreadCount).toBeDefined()
    })
    const notifications = result.current.notifications ?? []
    const unread = notifications.find(({ isRead }) => !isRead)
    const read = notifications.find(({ isRead }) => isRead)
    if (!unread || !read) {
      throw new Error('샘플에 읽은 알림과 읽지 않은 알림이 모두 필요합니다.')
    }

    const unreadCountBefore = result.current.unreadCount?.all ?? 0

    act(() => result.current.markAsRead(read))
    act(() => result.current.markAsRead(unread))

    await waitFor(() =>
      expect(result.current.notifications?.find(({ id }) => id === unread.id)?.isRead).toBe(true),
    )
    expect(result.current.unreadCount?.all).toBe(unreadCountBefore - 1)
    expect(markReadRequests).toEqual([[unread.id]])
  })

  it('읽음 처리 전에 시작한 조회가 늦게 끝나도 읽음 상태를 되돌리지 않는다', async () => {
    const firstOpen = renderNotificationPanelHook()
    await waitFor(() => expect(firstOpen.result.current.notifications).toBeDefined())
    const unread = firstOpen.result.current.notifications?.find(({ isRead }) => !isRead)
    const stalePage =
      firstOpen.queryClient.getQueryData<NotificationListData>(ALL_TAB_KEY)?.pages[0]
    if (!unread || !stalePage) {
      throw new Error('샘플에 읽지 않은 알림이 필요합니다.')
    }
    firstOpen.unmount()

    const staleRequest = delayNextNotificationsResponse(stalePage)
    const { result, unmount, queryClient } = renderNotificationPanelHook(firstOpen.queryClient)
    await waitFor(() => expect(staleRequest.hasReceivedRequest()).toBe(true))

    // 알림 링크 클릭과 함께 패널이 닫히는 흐름
    act(() => result.current.markAsRead(unread))
    unmount()
    const isUnreadMarkedInCache = () =>
      queryClient
        .getQueryData<NotificationListData>(ALL_TAB_KEY)
        ?.pages.flatMap(({ content }) => content)
        .find(({ id }) => id === unread.id)?.isRead
    await waitFor(() => expect(isUnreadMarkedInCache()).toBe(true))

    staleRequest.releaseResponse()
    await waitFor(() => expect(staleRequest.hasSentResponse()).toBe(true))
    await waitFor(() => expect(queryClient.isFetching()).toBe(0))

    expect(isUnreadMarkedInCache()).toBe(true)
  })

  it('목록 끝에서 다음 페이지를 이어 붙이고, 다 불러오면 더 요청하지 않는다', async () => {
    const { result } = renderNotificationPanelHook()
    await waitFor(() => expect(result.current.canLoadMore).toBe(true))

    while (result.current.canLoadMore) {
      const loadedCount = result.current.notifications?.length ?? 0
      act(() => result.current.loadMore())
      await waitFor(() => expect(result.current.notifications?.length).toBeGreaterThan(loadedCount))
    }

    const ids = result.current.notifications?.map(({ id }) => id) ?? []
    expect(new Set(ids).size).toBe(ids.length)
    expect(result.current.canLoadMore).toBe(false)
  })

  it('다음 페이지 요청이 실패하면 목록은 유지하고 다시 자동으로 요청하지 않는다', async () => {
    failNextPages()
    const { result } = renderNotificationPanelHook()
    await waitFor(() => expect(result.current.canLoadMore).toBe(true))

    act(() => result.current.loadMore())

    await waitFor(() => {
      expect(result.current.isLoadingMore).toBe(false)
      expect(result.current.canLoadMore).toBe(false)
    })
    expect(result.current.notifications).toBeDefined()
    expect(result.current.hasLoadError).toBe(false)
  })

  it('탭을 바꾸면 그 탭 알림만 다시 조회하고, 배지 숫자는 탭과 무관하게 유지한다', async () => {
    const { result, rerender } = renderNotificationPanelHook()
    await waitFor(() => {
      expect(result.current.notifications).toBeDefined()
      expect(result.current.unreadCount).toBeDefined()
    })
    const unreadCountBefore = result.current.unreadCount

    rerender({ tab: 'APPLICANT' })

    expect(result.current.notifications).toBeUndefined()
    expect(result.current.isLoading).toBe(true)
    expect(result.current.unreadCount).toEqual(unreadCountBefore)
    await waitFor(() => expect(result.current.notifications).toBeDefined())
    expect(result.current.notifications?.every(({ audience }) => audience === 'applicant')).toBe(
      true,
    )
  })
})
