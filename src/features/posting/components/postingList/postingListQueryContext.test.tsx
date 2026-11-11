import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PostingFilterPanel } from '@/features/posting/components/postingFilter/postingFilterPanel'
import { PostingListQueryProvider } from './postingListQueryContext'
import { PostingSearchField } from './postingSearchField'

const pushMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => '/postings',
  useSearchParams: () => new URLSearchParams(),
}))

function renderPostingListControls() {
  render(
    <PostingListQueryProvider>
      <PostingSearchField />
      <PostingFilterPanel />
    </PostingListQueryProvider>,
  )
}

describe('PostingListQueryProvider', () => {
  beforeEach(() => {
    pushMock.mockClear()
  })

  it('검색어 입력 직후 필터를 바꾸면 입력 중인 검색어를 함께 적용', async () => {
    const user = userEvent.setup()
    renderPostingListControls()

    await user.type(screen.getByRole('searchbox', { name: '공고 검색' }), 'UX')
    await user.click(screen.getByRole('checkbox', { name: '동아리' }))

    expect(pushMock).toHaveBeenCalledOnce()
    expect(pushMock).toHaveBeenCalledWith('/postings?type=club&q=UX', { scroll: false })
  })
})
