import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { parseDocumentReviewQuery } from '@/features/recruitment/utils/documentReviewQuery'
import { DocumentReviewBoard } from './documentReviewBoard'

const replace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}))

function getBoard(searchParams: Record<string, string> = {}) {
  return (
    <DocumentReviewBoard
      recruitmentId="1"
      query={parseDocumentReviewQuery(searchParams)}
      statusCounts={{ all: 48, pending: 14, done: 34 }}
      positionCounts={{ design: 20, development: 22, planning: 6 }}
      currentPage={1}
      totalPages={5}
    >
      <p>지원자 표</p>
    </DocumentReviewBoard>
  )
}

function renderBoard(searchParams: Record<string, string> = {}) {
  return render(getBoard(searchParams))
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  replace.mockClear()
})

describe('DocumentReviewBoard 이름 검색', () => {
  it('입력이 멈추고 300ms 뒤 한 번만 검색', () => {
    renderBoard({ page: '3' })

    const searchbox = screen.getByRole('searchbox', { name: '지원자 이름 검색' })
    fireEvent.change(searchbox, { target: { value: '김' } })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    fireEvent.change(searchbox, { target: { value: '김모' } })
    act(() => {
      vi.advanceTimersByTime(299)
    })

    expect(replace).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })

    expect(replace).toHaveBeenCalledTimes(1)
    expect(replace).toHaveBeenCalledWith('/manage/recruitments/1/documents?q=%EA%B9%80%EB%AA%A8', {
      scroll: false,
    })
  })

  it('검색어를 지우면 기다리지 않고 전체 목록으로 복귀', () => {
    renderBoard({ q: '김' })

    fireEvent.click(screen.getByRole('button', { name: '검색어 지우기' }))

    expect(replace).toHaveBeenCalledWith('/manage/recruitments/1/documents', { scroll: false })
  })

  it('URL의 검색어가 바뀌면 검색창과 다음 조건 변경에 반영', () => {
    const { rerender } = renderBoard({ q: '김' })

    rerender(getBoard())

    expect(screen.getByRole('searchbox', { name: '지원자 이름 검색' })).toHaveValue('')

    fireEvent.mouseDown(screen.getByRole('tab', { name: '평가 전 14' }))

    expect(replace).toHaveBeenLastCalledWith('/manage/recruitments/1/documents?status=pending', {
      scroll: false,
    })
  })

  it('입력 후 URL 반영 전에는 URL이 바뀌어도 입력값 유지', () => {
    const { rerender } = renderBoard({ q: '김' })
    const searchbox = screen.getByRole('searchbox', { name: '지원자 이름 검색' })

    fireEvent.change(searchbox, { target: { value: '김모' } })
    rerender(getBoard())

    expect(searchbox).toHaveValue('김모')
  })

  it('입력값이 URL에 반영된 뒤에는 다시 URL을 따름', () => {
    const { rerender } = renderBoard()
    const searchbox = screen.getByRole('searchbox', { name: '지원자 이름 검색' })

    fireEvent.change(searchbox, { target: { value: '김' } })
    rerender(getBoard({ q: '김' }))
    rerender(getBoard())

    expect(searchbox).toHaveValue('')
  })

  it('검색 대기 중 탭을 바꾸면 대기 검색 없이 탭과 검색어를 함께 적용', () => {
    renderBoard()

    fireEvent.change(screen.getByRole('searchbox', { name: '지원자 이름 검색' }), {
      target: { value: '김' },
    })
    // Radix Tabs는 mousedown에서 탭 전환
    fireEvent.mouseDown(screen.getByRole('tab', { name: '평가 전 14' }))
    act(() => {
      vi.advanceTimersByTime(300)
    })

    // 가짜 replace는 즉시 끝나 탭 전환이 중복 호출될 수 있어 호출 내용으로 검증
    expect(replace).not.toHaveBeenCalledWith('/manage/recruitments/1/documents?q=%EA%B9%80', {
      scroll: false,
    })
    expect(replace).toHaveBeenLastCalledWith(
      '/manage/recruitments/1/documents?status=pending&q=%EA%B9%80',
      { scroll: false },
    )
  })
})
