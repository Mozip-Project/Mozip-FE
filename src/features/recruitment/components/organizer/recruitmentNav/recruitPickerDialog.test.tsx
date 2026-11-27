import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { resetManagedPostings } from '@/features/posting/mocks/managedPostingHandlers'
import { ORGANIZATION_POSTING_ID } from '@/features/posting/mocks/organizationPostingSamples'
import { MOCK_ORGANIZATION_ID } from '@/mocks/mockOrganization'
import { ToastProvider } from '@/providers/toastProvider'
import { RecruitPickerDialog } from './recruitPickerDialog'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

async function openPicker() {
  const user = userEvent.setup()
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RecruitPickerDialog organizationId={MOCK_ORGANIZATION_ID}>
          <button type="button">모집 선택 열기</button>
        </RecruitPickerDialog>
      </ToastProvider>
    </QueryClientProvider>,
  )
  await user.click(screen.getByRole('button', { name: '모집 선택 열기' }))
  return user
}

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
})

afterEach(() => {
  resetManagedPostings()
  push.mockClear()
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('RecruitPickerDialog', () => {
  it('진행 중 공고를 고르면 공고 관리 상세로 이동', async () => {
    const user = await openPicker()

    await user.click(await screen.findByRole('button', { name: /UXUX 14기 운영진 모집/ }))

    expect(push).toHaveBeenCalledWith(`/manage/postings/${ORGANIZATION_POSTING_ID.recruiting}`)
  })

  it('작성 중 공고를 고르면 저장된 상태로 이어서 작성하는 화면으로 이동하고 팝업 닫힘', async () => {
    const user = await openPicker()

    await user.click(await screen.findByRole('tab', { name: /작성 중/ }))
    await user.click(await screen.findByRole('button', { name: 'UXUX 15기 운영진 추가 모집' }))

    expect(push).toHaveBeenCalledWith(`/manage/postings/${ORGANIZATION_POSTING_ID.draft}/edit`)
    expect(screen.queryByRole('dialog', { name: '모집 선택' })).not.toBeInTheDocument()
  })
})
