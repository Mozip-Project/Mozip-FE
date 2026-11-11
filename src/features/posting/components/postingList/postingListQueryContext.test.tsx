import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PostingFilterPanel } from '@/features/posting/components/postingFilter/postingFilterPanel'
import { PostingListPagination } from './postingListPagination'
import { PostingListQueryProvider } from './postingListQueryContext'
import { PostingSearchField } from './postingSearchField'
import type { ComponentProps } from 'react'

const pushMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => '/postings',
  useSearchParams: () => new URLSearchParams(),
}))

// 테스트 환경의 next/link는 라우터 context가 없으면 onNavigate를 부르지 않아 클릭 전달만 재현
vi.mock('next/link', () => ({
  default: ({
    onNavigate,
    ...props
  }: ComponentProps<'a'> & { onNavigate?: (event: { preventDefault: () => void }) => void }) => (
    <a
      {...props}
      onClick={(event) => {
        event.preventDefault()
        onNavigate?.({ preventDefault: () => {} })
      }}
    />
  ),
}))

function renderPostingListControls() {
  render(
    <PostingListQueryProvider>
      <PostingSearchField />
      <PostingFilterPanel />
      <PostingListPagination totalPages={3} />
    </PostingListQueryProvider>,
  )
}

describe('PostingListQueryProvider', () => {
  beforeEach(() => {
    pushMock.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('검색어 입력 직후 필터를 바꾸면 입력 중인 검색어를 함께 적용', async () => {
    const user = userEvent.setup()
    renderPostingListControls()

    await user.type(screen.getByRole('searchbox', { name: '공고 검색' }), 'UX')
    await user.click(screen.getByRole('checkbox', { name: '동아리' }))

    expect(pushMock).toHaveBeenCalledOnce()
    expect(pushMock).toHaveBeenCalledWith('/postings?type=club&q=UX', { scroll: false })
  })

  it('검색어 입력 직후 페이지를 고르면 입력값을 버리고 현재 조건의 해당 페이지로 이동', () => {
    vi.useFakeTimers()
    renderPostingListControls()
    const searchField = screen.getByRole('searchbox', { name: '공고 검색' })

    fireEvent.change(searchField, { target: { value: 'UX' } })
    fireEvent.click(screen.getByRole('link', { name: '2페이지' }))
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(pushMock).toHaveBeenCalledOnce()
    expect(pushMock).toHaveBeenCalledWith('/postings?page=2')
    expect(searchField).toHaveValue('')
  })

  it('검색 대기 중 뒤로·앞으로 가기를 하면 예약된 검색을 취소하고 입력값을 주소 기준으로 되돌림', () => {
    vi.useFakeTimers()
    renderPostingListControls()
    const searchField = screen.getByRole('searchbox', { name: '공고 검색' })

    fireEvent.change(searchField, { target: { value: 'UX' } })
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(pushMock).not.toHaveBeenCalled()
    expect(searchField).toHaveValue('')
  })
})
