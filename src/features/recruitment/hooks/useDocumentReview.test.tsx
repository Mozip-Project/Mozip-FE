import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { ORGANIZATION_POSTING_ID } from '@/features/posting/mocks/organizationPostingSamples'
import { parseDocumentReviewQuery } from '@/features/recruitment/utils/documentReviewQuery'
import { useDocumentReview } from './useDocumentReview'
import type { PropsWithChildren } from 'react'

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
})

afterAll(() => {
  vi.unstubAllEnvs()
})

function renderReview(postingId: string, searchParams: Record<string, string> = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  return renderHook(() => useDocumentReview(postingId, parseDocumentReviewQuery(searchParams)), {
    wrapper: Wrapper,
  })
}

describe('useDocumentReview (MSW)', () => {
  it('내 평가 없음은 평가하기, 저장 완료는 평가 수정으로 표시', async () => {
    const { result } = renderReview(ORGANIZATION_POSTING_ID.docReview)
    await waitFor(() => expect(result.current.data).toBeDefined())

    expect(
      result.current.data?.applicants.slice(0, 2).map(({ name, action }) => [name, action]),
    ).toEqual([
      ['정세나', 'evaluate'],
      ['이지원', 'edit'],
    ])
    expect(result.current.data?.statusCounts).toEqual({ all: 48, pending: 1, done: 47 })
  })

  it('결과 확정 후에는 모든 지원자의 버튼이 평가 보기', async () => {
    const { result } = renderReview(ORGANIZATION_POSTING_ID.noInterviewResult)
    await waitFor(() => expect(result.current.data).toBeDefined())

    expect(result.current.data?.hasPositions).toBe(false)
    expect(result.current.data?.positionOptions).toEqual([])
    expect(result.current.data?.applicants.every(({ action }) => action === 'view')).toBe(true)
  })

  it('평가 완료 탭이 비면 같은 조건의 첫 평가 전 지원자로 안내', async () => {
    const postingId = ORGANIZATION_POSTING_ID.docReview
    const { result } = renderReview(postingId, { status: 'done', q: '정세나' })
    await waitFor(() =>
      expect(result.current.startReviewHref).toBe(
        `/manage/postings/${postingId}/documents/application-${postingId}-1`,
      ),
    )

    expect(result.current.data?.applicants).toEqual([])
  })

  it('공고 조회 실패를 오류 상태로 반환', async () => {
    const { result } = renderReview('missing')
    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.data).toBeUndefined()
  })
})
