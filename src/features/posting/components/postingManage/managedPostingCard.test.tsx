import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { ORGANIZATION_POSTING_ID } from '@/features/posting/mocks/organizationPostingSamples'
import { toManagedPosting } from '@/features/posting/utils/managedPosting'
import type { ManagedPostingFieldsFragment } from '@/gql/graphql'
import { MOCK_ORGANIZATION_ID } from '@/mocks/mockOrganization'
import { ToastProvider } from '@/providers/toastProvider'
import { ManagedPostingCard } from './managedPostingCard'

const DAY_MS = 24 * 60 * 60 * 1000

function recruitingPosting(id: string): ManagedPostingFieldsFragment {
  return {
    id,
    title: `모집 ${id}`,
    status: 'RECRUITING',
    hasInterview: false,
    publishedAt: new Date(Date.now() - DAY_MS).toISOString(),
    recruitEndAt: new Date(Date.now() + 7 * DAY_MS).toISOString(),
    docResultConfirmedAt: null,
    docResultAt: null,
    finalResultAt: null,
    bumpRank: 1,
  }
}

function renderCard(posting: ManagedPostingFieldsFragment) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ManagedPostingCard
          organizationId={MOCK_ORGANIZATION_ID}
          posting={toManagedPosting(posting)}
        />
      </ToastProvider>
    </QueryClientProvider>,
  )
  return userEvent.setup()
}

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
  vi.stubEnv('NEXT_PUBLIC_POSTING_DEMO_MODE', 'enabled')
})

afterEach(() => {
  vi.restoreAllMocks()
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('ManagedPostingCard 시연 모드', () => {
  it('실서버 공고의 UP하기와 지원자 확인하기는 샘플 공고로 확인하라는 안내', async () => {
    const user = renderCard(recruitingPosting('4'))

    await user.click(screen.getByRole('button', { name: '모집 4 UP하기' }))
    expect(await screen.findByText('준비 중인 기능이에요')).toBeInTheDocument()
    expect(screen.getByText('시연에서는 샘플 공고로 확인해 주세요')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    expect(screen.getByRole('button', { name: '모집 4 지원자 확인하기' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '모집 4 지원자 확인하기' })).not.toBeInTheDocument()
  })

  it('샘플 공고는 그대로 UP 팝업과 지원자 관리 링크', async () => {
    const id = ORGANIZATION_POSTING_ID.recruiting
    const user = renderCard(recruitingPosting(id))

    expect(screen.getByRole('link', { name: `모집 ${id} 지원자 확인하기` })).toHaveAttribute(
      'href',
      `/manage/postings/${id}/applicants`,
    )
    await user.click(screen.getByRole('button', { name: `모집 ${id} UP하기` }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })
})
