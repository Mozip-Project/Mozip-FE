import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { publishPosting, savePostingDraft } from '@/features/posting/api/organizer/api'
import { resetManagedPostings } from '@/features/posting/mocks/managedPostingHandlers'
import { ORGANIZATION_POSTING_ID } from '@/features/posting/mocks/organizationPostingSamples'
import { resetPostingDrafts } from '@/features/posting/mocks/postingDraftHandlers'
import { MOCK_ORGANIZATION_ID } from '@/mocks/mockOrganization'
import { ToastProvider } from '@/providers/toastProvider'
import { PostingDraftEditContent } from './postingDraftEditContent'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

const DAY_MS = 24 * 60 * 60 * 1000

// jsdom 미지원
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function renderContent(postingId: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <PostingDraftEditContent postingId={postingId} savedOrganizationId={MOCK_ORGANIZATION_ID} />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

// 공고 정보 단계를 통과하는 저장된 공고
async function saveInfoReadyDraft() {
  const { id } = await savePostingDraft({
    organizationId: MOCK_ORGANIZATION_ID,
    input: {
      title: 'UXUX 15기 신입 부원 모집',
      content: '<p>함께해요</p>',
      allowEnrolled: true,
      images: [{ url: 'https://cdn.test/main.png', sortOrder: 0, isRepresentative: true }],
    },
  })
  return id
}

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
  vi.stubGlobal('ResizeObserver', ResizeObserverStub)
})

afterEach(() => {
  resetManagedPostings()
  resetPostingDrafts()
})

afterAll(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('PostingDraftEditContent', () => {
  it('저장된 작성 중 공고를 1단계부터 저장 값으로 열고 저장 시각 표시', async () => {
    renderContent(ORGANIZATION_POSTING_ID.draft)

    expect(await screen.findByRole('textbox', { name: /공고 제목/ })).toHaveValue(
      'UXUX 15기 운영진 추가 모집',
    )
    expect(screen.getByText(/공고 정보/).closest('li')).toHaveAttribute('aria-current', 'step')
    expect(screen.getByText('저장 완료')).toBeInTheDocument()
  })

  it('입력 조건을 처음 통과하지 못한 단계까지만 탭으로 이동 가능', async () => {
    const postingId = await saveInfoReadyDraft()
    renderContent(postingId)

    const stepList = await screen.findByRole('list', { name: '공고 작성 단계' })
    expect(within(stepList).getByRole('button', { name: /모집 일정/ })).toBeInTheDocument()
    expect(within(stepList).queryByRole('button', { name: /모집 방식/ })).not.toBeInTheDocument()
  })

  it('게시된 공고는 이어서 작성할 수 없음', async () => {
    const postingId = await saveInfoReadyDraft()
    await savePostingDraft({
      organizationId: MOCK_ORGANIZATION_ID,
      id: postingId,
      input: {
        recruitStartAt: new Date(Date.now() - DAY_MS).toISOString(),
        recruitEndAt: new Date(Date.now() + 7 * DAY_MS).toISOString(),
        noPosition: true,
        questions: [{ type: 'TEXT', title: '자기소개', required: true, sortOrder: 0 }],
      },
    })
    await publishPosting(postingId)
    renderContent(postingId)

    expect(await screen.findByText('이미 게시된 공고예요')).toBeInTheDocument()
  })

  it('없는 공고는 찾을 수 없음 안내', async () => {
    renderContent('missing')

    expect(await screen.findByText('공고를 찾을 수 없어요')).toBeInTheDocument()
  })
})
