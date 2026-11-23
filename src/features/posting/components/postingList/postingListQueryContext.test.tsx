import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PostingFilterPanel } from '@/features/posting/components/postingFilter/postingFilterPanel'
import { PostingListPagination } from './postingListPagination'
import { PostingListQueryProvider } from './postingListQueryContext'
import { PostingSearchField } from './postingSearchField'
import type { ComponentProps } from 'react'

const pushMock = vi.fn()
const replaceMock = vi.fn()
let currentSearch = ''

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  usePathname: () => '/postings',
  useSearchParams: () => new URLSearchParams(currentSearch),
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
    replaceMock.mockClear()
    currentSearch = ''
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

  it('검색어 없이 검색을 시작하면 앞뒤 공백을 뺀 검색어로 기록을 남기며 이동', () => {
    vi.useFakeTimers()
    renderPostingListControls()

    fireEvent.change(screen.getByRole('searchbox', { name: '공고 검색' }), {
      target: { value: ' UX ' },
    })
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(pushMock).toHaveBeenCalledWith('/postings?q=UX', { scroll: false })
    expect(replaceMock).not.toHaveBeenCalled()
  })

  it('이미 검색 중이면 고친 검색어로 현재 기록을 교체', () => {
    vi.useFakeTimers()
    currentSearch = 'q=UX'
    renderPostingListControls()

    fireEvent.change(screen.getByRole('searchbox', { name: '공고 검색' }), {
      target: { value: 'UX 디자인' },
    })
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(replaceMock).toHaveBeenCalledWith('/postings?q=UX+%EB%94%94%EC%9E%90%EC%9D%B8', {
      scroll: false,
    })
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('공백만 덧붙이면 같은 검색이라 이동하지 않고 입력값은 유지', () => {
    vi.useFakeTimers()
    currentSearch = 'q=UX'
    renderPostingListControls()
    const searchField = screen.getByRole('searchbox', { name: '공고 검색' })

    fireEvent.change(searchField, { target: { value: 'UX ' } })
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(pushMock).not.toHaveBeenCalled()
    expect(replaceMock).not.toHaveBeenCalled()
    expect(searchField).toHaveValue('UX ')
  })

  it('검색을 제출하면 기다리지 않고 바로 검색하고, 예약된 검색은 다시 실행하지 않음', () => {
    vi.useFakeTimers()
    renderPostingListControls()

    fireEvent.change(screen.getByRole('searchbox', { name: '공고 검색' }), {
      target: { value: 'UX' },
    })
    fireEvent.submit(screen.getByRole('search'))
    expect(pushMock).toHaveBeenCalledOnce()
    expect(pushMock).toHaveBeenCalledWith('/postings?q=UX', { scroll: false })

    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(pushMock).toHaveBeenCalledOnce()
  })

  it('검색 중 검색어를 모두 지우면 기록을 남기며 전체 목록으로 이동', () => {
    currentSearch = 'q=UX'
    renderPostingListControls()

    fireEvent.change(screen.getByRole('searchbox', { name: '공고 검색' }), {
      target: { value: '' },
    })

    expect(pushMock).toHaveBeenCalledWith('/postings', { scroll: false })
    expect(replaceMock).not.toHaveBeenCalled()
  })
})
