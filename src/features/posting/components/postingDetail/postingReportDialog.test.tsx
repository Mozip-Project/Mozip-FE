import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import type { ReportPostingMutation, ReportPostingMutationVariables } from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { server } from '@/mocks/server'
import { ToastProvider } from '@/providers/toastProvider'
import { PostingReportDialog } from './postingReportDialog'

function renderPostingReportDialog() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })

  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <PostingReportDialog postingId="posting-1" postingTitle="테스트 공고" />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

// 테스트가 응답 시점을 정하도록 release 전까지 응답 보류
function holdReportResponse() {
  let release = () => {}
  const released = new Promise<void>((resolve) => {
    release = resolve
  })

  server.use(
    graphqlApi.mutation<ReportPostingMutation, ReportPostingMutationVariables>(
      'ReportPosting',
      async () => {
        await released
        return HttpResponse.json({ data: { reportPosting: true } })
      },
    ),
  )
  return release
}

// jsdom 미지원, form 안에서 Radix 숨김 input이 사용
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
  vi.stubGlobal('ResizeObserver', ResizeObserverStub)
})

afterAll(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('PostingReportDialog', () => {
  it('신고 요청 중에는 닫히지 않고 접수되면 닫힌다', async () => {
    const user = userEvent.setup()
    const releaseResponse = holdReportResponse()
    renderPostingReportDialog()

    await user.click(screen.getByRole('button', { name: '신고하기' }))
    const dialog = screen.getByRole('dialog')
    await user.click(screen.getByRole('radio', { name: '기타' }))
    await user.click(screen.getByRole('button', { name: '신고하기' }))

    await waitFor(() => expect(screen.getByRole('button', { name: '취소' })).toBeDisabled())
    await user.keyboard('{Escape}')
    expect(dialog).toBeInTheDocument()

    releaseResponse()

    await waitFor(() => expect(dialog).not.toBeInTheDocument())
    expect(await screen.findByText('신고가 접수됐어요. 확인 후 조치할게요.')).toBeInTheDocument()
  })
})
