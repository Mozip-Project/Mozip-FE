import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { ORGANIZATION_POSTING_ID } from '@/features/posting/mocks/organizationPostingSamples'
import { parseDocumentResultQuery } from '@/features/recruitment/utils/documentResultQuery'
import { graphqlApi } from '@/mocks/graphqlApi'
import { server } from '@/mocks/server'
import { useDocumentResults } from './useDocumentResults'
import type { PropsWithChildren } from 'react'

const POSTING_ID = ORGANIZATION_POSTING_ID.docReview
// MSW 샘플에서 보류인 지원자(한결, 오하늘, 유채린, 양소율), MSW 상태가 테스트 사이에 이어져 테스트마다 다른 지원자 사용
const HOLD_APPLICATION_IDS = [`application-${POSTING_ID}-4`, `application-${POSTING_ID}-5`]
const TAB_SWITCH_APPLICATION_ID = `application-${POSTING_ID}-19`
const LEAVE_APPLICATION_ID = `application-${POSTING_ID}-34`
// 저장 대기(500ms) + 재조회
const SAVE_TIMEOUT_MS = 3000
// 저장 대기(500ms)가 충분히 지난 시점
const SAVE_DELAY_PASSED_MS = 1000

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
})

afterAll(() => {
  vi.unstubAllEnvs()
})

function renderResults(initialSearchParams: Record<string, string> = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  return renderHook(
    ({ searchParams }) => useDocumentResults(POSTING_ID, parseDocumentResultQuery(searchParams)),
    { wrapper: Wrapper, initialProps: { searchParams: initialSearchParams } },
  )
}

function findResult(
  result: { current: ReturnType<typeof useDocumentResults> },
  applicationId: string,
) {
  return result.current.data?.applicants.find(({ id }) => id === applicationId)?.result
}

// 요청 수만 세고 응답은 기본 MSW handler로 넘김
function countSetDocResultRequests() {
  const requests: unknown[] = []
  server.use(
    graphqlApi.mutation('SetDocResult', ({ variables }) => {
      requests.push(variables)
    }),
  )
  return requests
}

// 단언을 마칠 때까지 저장 응답 보류, 풀면 기본 MSW handler로 넘김
function holdSetDocResultResponse() {
  const { promise, resolve } = Promise.withResolvers<void>()
  server.use(
    graphqlApi.mutation('SetDocResult', async () => {
      await promise
    }),
  )
  return resolve
}

describe('useDocumentResults 결과 변경 (MSW)', () => {
  it('바꾼 결과는 바로 보이고, 같은 결과로 연달아 바꾸면 한 번에 저장', async () => {
    const requests = countSetDocResultRequests()
    const { result } = renderResults()
    await waitFor(() => expect(result.current.data).toBeDefined())
    const [first, second] = HOLD_APPLICATION_IDS as [string, string]

    act(() => {
      result.current.changeResult(first, 'pass')
      result.current.changeResult(second, 'pass')
    })

    expect(findResult(result, first)).toBe('pass')
    expect(findResult(result, second)).toBe('pass')
    expect(result.current.isSaving).toBe(true)

    await waitFor(() => expect(result.current.isSaving).toBe(false), { timeout: SAVE_TIMEOUT_MS })

    expect(requests).toEqual([{ applicationIds: HOLD_APPLICATION_IDS, result: 'PASS' }])
    expect(findResult(result, first)).toBe('pass')
    expect(result.current.data?.totals.holdCount).toBe(2)
  })

  it('저장 전에 다른 탭으로 옮겨도 탭 숫자와 보류 인원에 바꾼 결과 반영', async () => {
    const { result, rerender } = renderResults({ status: 'hold' })
    await waitFor(() => expect(result.current.data).toBeDefined())
    const holdCount = result.current.data?.totals.holdCount ?? 0
    const passTabCount = result.current.data?.statusCounts.pass ?? 0

    // 새 탭 조회가 늦어 저장·재조회가 먼저 끝나는 경우 방지
    const releaseSave = holdSetDocResultResponse()
    try {
      act(() => result.current.changeResult(TAB_SWITCH_APPLICATION_ID, 'pass'))
      rerender({ searchParams: { status: 'pass' } })
      await waitFor(() => expect(result.current.isPlaceholderData).toBe(false))

      expect(result.current.isSaving).toBe(true)
      expect(result.current.data?.statusCounts.pass).toBe(passTabCount + 1)
      expect(result.current.data?.totals.holdCount).toBe(holdCount - 1)
    } finally {
      releaseSave()
    }

    await waitFor(() => expect(result.current.isSaving).toBe(false), { timeout: SAVE_TIMEOUT_MS })
  })

  it('저장 중에 다시 바꾸면 앞선 저장이 끝난 뒤 마지막 결과 저장', async () => {
    // 응답 전에 요청 수를 세도록 보류 handler 먼저 등록
    const releaseSave = holdSetDocResultResponse()
    const requests = countSetDocResultRequests()
    const { result } = renderResults({ status: 'fail' })
    await waitFor(() => expect(result.current.data?.applicants[0]).toBeDefined())
    const applicationId = result.current.data?.applicants[0]?.id ?? ''

    try {
      act(() => result.current.changeResult(applicationId, 'pass'))
      await waitFor(() => expect(requests).toHaveLength(1), { timeout: SAVE_TIMEOUT_MS })
      act(() => result.current.changeResult(applicationId, 'fail'))
      await new Promise((resolve) => setTimeout(resolve, SAVE_DELAY_PASSED_MS))

      expect(requests).toHaveLength(1)
      expect(result.current.isSaving).toBe(true)
    } finally {
      releaseSave()
    }

    await waitFor(() => expect(result.current.isSaving).toBe(false), { timeout: SAVE_TIMEOUT_MS })
    expect(requests).toEqual([
      { applicationIds: [applicationId], result: 'PASS' },
      { applicationIds: [applicationId], result: 'FAIL' },
    ])
    expect(findResult(result, applicationId)).toBe('fail')
  })

  it('저장 전에 화면을 떠나도 모아 둔 변경을 저장', async () => {
    const requests = countSetDocResultRequests()
    const { result, unmount } = renderResults({ status: 'hold' })
    await waitFor(() => expect(result.current.data).toBeDefined())

    act(() => result.current.changeResult(LEAVE_APPLICATION_ID, 'fail'))
    unmount()

    await waitFor(() =>
      expect(requests).toEqual([{ applicationIds: [LEAVE_APPLICATION_ID], result: 'FAIL' }]),
    )
  })
})
