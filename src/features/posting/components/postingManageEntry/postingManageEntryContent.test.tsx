import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { resetManagedPostings } from '@/features/posting/mocks/managedPostingHandlers'
import { PostingManageEntryContent } from './postingManageEntryContent'

const replace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace }),
}))

function renderEntry(savedOrganizationId: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <QueryClientProvider client={queryClient}>
      <PostingManageEntryContent savedOrganizationId={savedOrganizationId} />
    </QueryClientProvider>,
  )
}

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
})

afterEach(() => {
  resetManagedPostings()
  replace.mockClear()
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('PostingManageEntryContent', () => {
  it('진행 중 공고가 있으면 첫 공고 관리 상세로 이동', async () => {
    renderEntry('1')

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/manage/postings/uxux-14-doc-review'))
    expect(screen.queryByText('아직 관리할 모집이 없어요')).not.toBeInTheDocument()
  })

  it('진행 중 공고가 없으면 이동하지 않고 새 모집 만들기 안내', async () => {
    renderEntry('2')

    expect(await screen.findByText('아직 관리할 모집이 없어요')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '새 모집 만들기' })).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })
})
