import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { ORGANIZATION_POSTING_ID } from '@/features/posting/mocks/organizationPostingSamples'
import {
  createPostingSample,
  POSTING_SAMPLE_ID,
} from '@/features/posting/mocks/postingDetailHandlers'
import { graphqlApi } from '@/mocks/graphqlApi'
import { MOCK_ORGANIZATION_ID } from '@/mocks/mockOrganization'
import { server } from '@/mocks/server'
import { ToastProvider } from '@/providers/toastProvider'
import { PostingManageDetailContent } from './postingManageDetailContent'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

function renderDetail(postingId: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <PostingManageDetailContent postingId={postingId} savedOrganizationId={undefined} />
      </ToastProvider>
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
    renderDetail(ORGANIZATION_POSTING_ID.docReview)

    expect(
      await screen.findByRole('heading', { level: 1, name: '서류 평가 진행 중이래' }),
    ).toBeInTheDocument()
    const detailCard = screen.getByRole('region', { name: '공고 상세 내용' })
    expect(within(detailCard).getByText('디자인, 개발, 기획')).toBeInTheDocument()
    expect(within(detailCard).getByText('있음')).toBeInTheDocument()
    expect(within(detailCard).getByText('면접 기간')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '서류 평가 진행 중이래' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '공지 보내기' }))
    expect(await screen.findByRole('button', { name: '48명에게 보내기' })).toBeInTheDocument()
  })

  it('비면접 공고는 면접 없음, 면접 기간 행 없음', async () => {
    renderDetail(ORGANIZATION_POSTING_ID.recruiting)

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
    renderDetail(ORGANIZATION_POSTING_ID.docReview)

    const retryButton = await screen.findByRole('button', { name: '다시 시도' })
    server.resetHandlers()
    await user.click(retryButton)

    expect(
      await screen.findByRole('heading', { level: 1, name: '서류 평가 진행 중이래' }),
    ).toBeInTheDocument()
  })

  it('공고 수정하기는 준비 중 안내', async () => {
    const user = userEvent.setup()
    renderDetail(ORGANIZATION_POSTING_ID.docReview)

    await user.click(await screen.findByRole('button', { name: '공고 수정하기' }))

    expect(await screen.findByText('준비 중인 기능이에요')).toBeInTheDocument()
  })

  it('공지를 보내면 팝업을 닫고 완료 안내', async () => {
    const user = userEvent.setup()
    renderDetail(ORGANIZATION_POSTING_ID.docReview)

    await user.click(await screen.findByRole('button', { name: '공지 보내기' }))
    await user.click(await screen.findByRole('button', { name: '48명에게 보내기' }))

    expect(await screen.findByText('공지를 보냈어요')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('보내기를 연달아 제출해도 공지는 한 번만 발송', async () => {
    let sendCount = 0
    server.use(
      graphqlApi.mutation('SendNotice', () => {
        sendCount += 1
      }),
    )
    const user = userEvent.setup()
    renderDetail(ORGANIZATION_POSTING_ID.docReview)

    await user.click(await screen.findByRole('button', { name: '공지 보내기' }))
    const sendButton = await screen.findByRole('button', { name: '48명에게 보내기' })
    // 다시 그리기 전에 두 번 제출
    fireEvent.click(sendButton)
    fireEvent.click(sendButton)

    expect(await screen.findByText('공지를 보냈어요')).toBeInTheDocument()
    expect(sendCount).toBe(1)
  })

  it('받을 지원자가 없으면 팝업 안에 오류 안내', async () => {
    server.use(
      graphqlApi.mutation('SendNotice', () =>
        HttpResponse.json({
          errors: [{ message: '받는 사람 없음', extensions: { code: 'MESSAGE_422' } }],
          data: null,
        }),
      ),
    )
    const user = userEvent.setup()
    renderDetail(ORGANIZATION_POSTING_ID.recruiting)

    await user.click(await screen.findByRole('button', { name: '공지 보내기' }))
    await user.click(await screen.findByRole('button', { name: '12명에게 보내기' }))

    const dialog = screen.getByRole('dialog')
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      '공지를 받을 수 있는 지원자가 없어요',
    )
  })

  it('입력 칸이 없는 필드 오류만 오면 팝업 안에 오류 안내', async () => {
    server.use(
      graphqlApi.mutation('SendNotice', () =>
        HttpResponse.json({
          errors: [
            {
              message: '입력값을 확인해 주세요.',
              extensions: {
                code: 'COMMON_400',
                fieldErrors: [{ field: 'postingId', message: '공고 ID가 올바르지 않습니다' }],
              },
            },
          ],
          data: null,
        }),
      ),
    )
    const user = userEvent.setup()
    renderDetail(ORGANIZATION_POSTING_ID.docReview)

    await user.click(await screen.findByRole('button', { name: '공지 보내기' }))
    await user.click(await screen.findByRole('button', { name: '48명에게 보내기' }))

    expect(await within(screen.getByRole('dialog')).findByRole('alert')).toHaveTextContent(
      '공지를 보내지 못했어요. 잠시 후 다시 시도해 주세요',
    )
  })

  it('서버가 제목 오류를 주면 제목 입력 아래 표시하고 제목으로 포커스', async () => {
    server.use(
      graphqlApi.mutation('SendNotice', () =>
        HttpResponse.json({
          errors: [
            {
              message: '입력값을 확인해 주세요.',
              extensions: {
                code: 'COMMON_400',
                fieldErrors: [{ field: 'subject', message: '제목은 1~100자로 입력해 주세요' }],
              },
            },
          ],
          data: null,
        }),
      ),
    )
    const user = userEvent.setup()
    renderDetail(ORGANIZATION_POSTING_ID.docReview)

    await user.click(await screen.findByRole('button', { name: '공지 보내기' }))
    await user.click(await screen.findByRole('button', { name: '48명에게 보내기' }))

    const subjectInput = await screen.findByRole('textbox', { name: /메일 제목/ })
    await waitFor(() =>
      expect(subjectInput).toHaveAccessibleDescription('제목은 1~100자로 입력해 주세요'),
    )
    await waitFor(() => expect(subjectInput).toHaveFocus())
    expect(within(screen.getByRole('dialog')).queryByRole('alert')).not.toBeInTheDocument()
  })
})

// 전시회 후 삭제
describe('PostingManageDetailContent 시연 모드', () => {
  beforeAll(() => {
    vi.stubEnv('NEXT_PUBLIC_POSTING_DEMO_MODE', 'enabled')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // 실서버 조회는 MSW를 거치지 않아(bypass) fetch에서 해당 operation만 대체
  function mockServerPostingDetail(posting: object) {
    const mswFetch = globalThis.fetch
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const body = input instanceof Request ? await input.clone().text() : ''
      if (body.includes('DemoServerPostingDetail')) {
        return Response.json({ data: { posting } })
      }
      return mswFetch(input, init)
    })
  }

  it('실서버 공고는 실서버 상세를 보여 주고 공지 보내기는 안내만', async () => {
    const sample = createPostingSample(ORGANIZATION_POSTING_ID.docReview, '2026-11-26')
    if (!sample) {
      throw new Error('샘플 공고 없음')
    }
    const { otherActivePostings: _, ...posting } = sample
    const serverPosting = {
      ...posting,
      id: '7',
      title: '실서버 공고',
      organization: { ...posting.organization, id: MOCK_ORGANIZATION_ID },
    }
    mockServerPostingDetail(serverPosting)
    const user = userEvent.setup()
    renderDetail('7')

    expect(
      await screen.findByRole('heading', { level: 1, name: '실서버 공고' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '공지 보내기' }))

    expect(await screen.findByText('시연에서는 샘플 공고로 확인해 주세요')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
