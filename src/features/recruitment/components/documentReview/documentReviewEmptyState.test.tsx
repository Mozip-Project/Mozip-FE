import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  getDocumentReviewHref,
  parseDocumentReviewQuery,
} from '@/features/recruitment/utils/documentReviewQuery'
import { DocumentReviewBoard } from './documentReviewBoard'
import { DocumentReviewEmptyState } from './documentReviewEmptyState'
import type { Route } from 'next'

const replace = vi.fn()
const RESET_HREF = getDocumentReviewHref('1', parseDocumentReviewQuery({ status: 'pending' }))
const START_REVIEW_HREF = '/manage/recruitments/1/documents/3' as Route

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}))

afterEach(() => {
  replace.mockClear()
})

describe('DocumentReviewEmptyState', () => {
  it('포지션 필터 결과가 0명이면 안내와 필터 초기화 버튼 표시', async () => {
    const user = userEvent.setup()
    render(
      <DocumentReviewEmptyState
        recruitmentId="1"
        status="pending"
        totalCount={0}
        keyword=""
        resetFilterHref={RESET_HREF}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('조건에 맞는 지원자가 없어요')

    await user.click(screen.getByRole('button', { name: '필터 초기화' }))

    expect(replace).toHaveBeenCalledWith('/manage/recruitments/1/documents?status=pending', {
      scroll: false,
    })
  })

  it('지원자가 있는데 평가 완료 탭이 0명이면 평가 전 첫 지원자의 평가 화면으로 이동 안내 표시', () => {
    render(
      <DocumentReviewEmptyState
        recruitmentId="1"
        status="done"
        totalCount={12}
        keyword=""
        startReviewHref={START_REVIEW_HREF}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('아직 평가한 지원자가 없어요')
    expect(screen.getByRole('link', { name: '평가 시작하기' })).toHaveAttribute(
      'href',
      '/manage/recruitments/1/documents/3',
    )
  })

  it('검색 결과가 0명이면 포지션 필터보다 검색 안내를 먼저 표시하고, 검색어 삭제 시 검색창까지 비움', async () => {
    const user = userEvent.setup()
    render(
      <DocumentReviewBoard
        recruitmentId="1"
        query={parseDocumentReviewQuery({ q: '홍길동', position: 'design' })}
        statusCounts={{ all: 0, pending: 0, done: 0 }}
        positionCounts={{ design: 0, development: 0, planning: 0 }}
        currentPage={1}
        totalPages={0}
      >
        <DocumentReviewEmptyState
          recruitmentId="1"
          status="all"
          totalCount={0}
          keyword="홍길동"
          resetFilterHref={RESET_HREF}
        />
      </DocumentReviewBoard>,
    )
    const searchbox = screen.getByRole('searchbox', { name: '지원자 이름 검색' })

    expect(screen.getByRole('status')).toHaveTextContent("'홍길동'에 해당하는 지원자가 없어요")
    expect(screen.queryByRole('button', { name: '필터 초기화' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '검색어 삭제' }))

    expect(searchbox).toHaveValue('')
    expect(searchbox).toHaveFocus()
    expect(replace).toHaveBeenCalledWith('/manage/recruitments/1/documents?position=design', {
      scroll: false,
    })
  })

  it('필터·검색 없이 전체 지원자가 0명이면 지원자 없음 안내 표시', () => {
    render(
      <DocumentReviewEmptyState recruitmentId="1" status="pending" totalCount={0} keyword="" />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('아직 지원자가 없어요')
    expect(screen.getByRole('button', { name: '공고 링크 복사' })).toBeInTheDocument()
  })

  it('지원자가 있는데 평가 전 탭이 0명이면 평가 결과 취합으로 이동 안내 표시', () => {
    render(
      <DocumentReviewEmptyState recruitmentId="1" status="pending" totalCount={48} keyword="" />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('모든 지원서 평가를 마쳤어요')
    expect(screen.getByRole('link', { name: '평가 결과 취합으로 이동' })).toHaveAttribute(
      'href',
      '/manage/recruitments/1/documents/summary',
    )
  })

  it('포지션 필터를 건 지원자가 모두 평가 완료면 필터 안내 대신 평가 모두 완료 안내 표시', () => {
    render(
      <DocumentReviewEmptyState
        recruitmentId="1"
        status="pending"
        totalCount={6}
        keyword=""
        resetFilterHref={RESET_HREF}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('모든 지원서 평가를 마쳤어요')
    expect(screen.queryByRole('button', { name: '필터 초기화' })).not.toBeInTheDocument()
  })
})
