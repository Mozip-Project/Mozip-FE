import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { POSTING_SAMPLE_ID } from '@/features/posting/mocks/postingDetailHandlers'
import { graphqlApi } from '@/mocks/graphqlApi'
import { server } from '@/mocks/server'
import { PostingManageDetailContent } from './postingManageDetailContent'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

function renderDetail(postingId: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <QueryClientProvider client={queryClient}>
      <PostingManageDetailContent postingId={postingId} savedOrganizationId={undefined} />
    </QueryClientProvider>,
  )
}

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('PostingManageDetailContent', () => {
  it('현재 단체 공고의 상세 표와 미리보기, 공지 받는 사람 수 표시', async () => {
    const user = userEvent.setup()
    renderDetail(POSTING_SAMPLE_ID.open)

    expect(
      await screen.findByRole('heading', { level: 1, name: 'UXUX 14기 신입 부원 모집' }),
    ).toBeInTheDocument()
    const detailCard = screen.getByRole('region', { name: '공고 상세 내용' })
    expect(within(detailCard).getByText('디자인, 개발, 기획')).toBeInTheDocument()
    expect(within(detailCard).getByText('있음')).toBeInTheDocument()
    expect(within(detailCard).getByText('면접 기간')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'UXUX 14기 신입 부원 모집' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '공지 보내기' }))
    expect(await screen.findByRole('button', { name: '24명에게 보내기' })).toBeInTheDocument()
  })

  it('비면접 공고는 면접 없음, 면접 기간 행 없음', async () => {
    renderDetail(POSTING_SAMPLE_ID.staff)

    const detailCard = await screen.findByRole('region', { name: '공고 상세 내용' })
    expect(within(detailCard).getByText('없음')).toBeInTheDocument()
    expect(within(detailCard).queryByText('면접 기간')).not.toBeInTheDocument()
  })

  it('다른 단체 공고는 찾을 수 없다고 표시', async () => {
    renderDetail(POSTING_SAMPLE_ID.direct)

    expect(await screen.findByText('공고를 찾을 수 없어요')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: '공고 상세 내용' })).not.toBeInTheDocument()
  })

  it('없는 공고는 찾을 수 없다고 표시', async () => {
    renderDetail('999')

    expect(await screen.findByText('공고를 찾을 수 없어요')).toBeInTheDocument()
  })

  it('조회에 실패하면 오류 안내, 다시 시도로 복구', async () => {
    server.use(
      graphqlApi.query('ManagedPostingDetail', () =>
        HttpResponse.json({
          errors: [{ message: '서버 오류', extensions: { code: 'COMMON_500' } }],
          data: null,
        }),
      ),
    )
    const user = userEvent.setup()
    renderDetail(POSTING_SAMPLE_ID.open)

    const retryButton = await screen.findByRole('button', { name: '다시 시도' })
    server.resetHandlers()
    await user.click(retryButton)

    expect(
      await screen.findByRole('heading', { level: 1, name: 'UXUX 14기 신입 부원 모집' }),
    ).toBeInTheDocument()
  })
})
