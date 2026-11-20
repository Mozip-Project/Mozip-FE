import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { resetReportedPostings } from '@/features/posting/mocks/postingReportHandlers'
import type { ReportPostingMutation, ReportPostingMutationVariables } from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { server } from '@/mocks/server'
import { ToastProvider } from '@/providers/toastProvider'
import { usePostingReportForm } from './usePostingReportForm'
import type { ReactNode } from 'react'

const POSTING_ID = 'posting-1'
const REPORT_FAILED_MESSAGE = '신고하지 못했어요. 잠시 후 다시 시도해 주세요.'

function renderPostingReportFormHook() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const onClose = vi.fn()

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    )
  }

  const { result } = renderHook(() => usePostingReportForm({ postingId: POSTING_ID, onClose }), {
    wrapper: Wrapper,
  })
  return { result, onClose }
}

// 신고 요청의 variables 기록, isReported로 서버 응답 지정
function recordReportRequests(isReported = true) {
  const requests: ReportPostingMutationVariables[] = []
  server.use(
    graphqlApi.mutation<ReportPostingMutation, ReportPostingMutationVariables>(
      'ReportPosting',
      ({ variables }) => {
        requests.push(variables)
        return HttpResponse.json({ data: { reportPosting: isReported } })
      },
    ),
  )
  return requests
}

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
})

afterEach(() => {
  resetReportedPostings()
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('usePostingReportForm', () => {
  it('내용이 공백뿐이면 detail 없이 보낸다', async () => {
    const requests = recordReportRequests()
    const { result } = renderPostingReportFormHook()

    act(() => {
      result.current.changeReason('FALSE_INFO')
      result.current.changeDetail('   ')
    })
    act(() => result.current.submit())

    await waitFor(() => expect(requests).toHaveLength(1))
    expect(requests[0]?.detail).toBeUndefined()
  })

  it('서버가 false를 돌려주면 닫지 않고 실패를 알린다', async () => {
    recordReportRequests(false)
    const { result, onClose } = renderPostingReportFormHook()

    act(() => result.current.changeReason('EXCESSIVE_PERSONAL_INFO'))
    act(() => result.current.submit())

    expect(await screen.findByText(REPORT_FAILED_MESSAGE)).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('이미 신고한 공고면 닫고 이미 신고했다고 알린다', async () => {
    const first = renderPostingReportFormHook()
    act(() => first.result.current.changeReason('ETC'))
    act(() => first.result.current.submit())
    await waitFor(() => expect(first.onClose).toHaveBeenCalledOnce())

    const second = renderPostingReportFormHook()
    act(() => second.result.current.changeReason('ETC'))
    act(() => second.result.current.submit())

    await waitFor(() => expect(second.onClose).toHaveBeenCalledOnce())
    expect(await screen.findByText('이미 신고한 공고예요.')).toBeInTheDocument()
  })

  it('그 밖의 오류에는 닫지 않고 실패를 알린다', async () => {
    server.use(
      graphqlApi.mutation('ReportPosting', () =>
        HttpResponse.json({
          errors: [{ message: '공고 없음', extensions: { code: 'POSTING_404' } }],
          data: null,
        }),
      ),
    )
    const { result, onClose } = renderPostingReportFormHook()

    act(() => result.current.changeReason('ETC'))
    act(() => result.current.submit())

    expect(await screen.findByText(REPORT_FAILED_MESSAGE)).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
  })
})
