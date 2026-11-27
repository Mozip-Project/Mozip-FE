import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { POSTING_SAMPLE_ID } from '@/features/posting/mocks/postingDetailHandlers'
import { ToastProvider } from '@/providers/toastProvider'
import { PostingApplyButton } from './postingApplyButton'

function renderButton(postingId: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <PostingApplyButton postingId={postingId} />
      </ToastProvider>
    </QueryClientProvider>,
  )
  return userEvent.setup()
}

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
  vi.stubEnv('NEXT_PUBLIC_POSTING_DEMO_MODE', 'enabled')
})

afterAll(() => {
  vi.unstubAllEnvs()
})

// 전시회 후 삭제
describe('PostingApplyButton 시연 모드', () => {
  it('실서버 공고의 지원하기는 샘플 공고로 확인하라는 안내', async () => {
    const user = renderButton('4')

    await user.click(screen.getByRole('button', { name: '지원하기' }))

    expect(await screen.findByText('시연에서는 샘플 공고로 확인해 주세요')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('샘플 공고는 그대로 지원하기 연결', async () => {
    renderButton(POSTING_SAMPLE_ID.open)

    expect(await screen.findByRole('link', { name: '지원하기' })).toHaveAttribute(
      'href',
      `/postings/${POSTING_SAMPLE_ID.open}/apply`,
    )
  })
})
