import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DocumentReviewApplicantTable } from './documentReviewApplicantTable'
import { DocumentReviewBoard } from './documentReviewBoard'
import { getDocumentReviewHref, parseDocumentReviewQuery } from './documentReviewQuery'

const replace = vi.fn()
const RESET_HREF = getDocumentReviewHref('1', parseDocumentReviewQuery({ status: 'pending' }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}))

afterEach(() => {
  replace.mockClear()
})

describe('DocumentReviewApplicantTable', () => {
  it('포지션 필터 결과가 0명이면 안내와 필터 초기화 버튼 표시', async () => {
    const user = userEvent.setup()
    render(
      <DocumentReviewApplicantTable
        recruitmentId="1"
        applicants={[]}
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

  it('조건 없이 평가 완료 탭이 0명이면 안내 미표시(Figma 미정의)', () => {
    render(
      <DocumentReviewApplicantTable
        recruitmentId="1"
        applicants={[]}
        status="done"
        totalCount={12}
        keyword=""
      />,
    )

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '필터 초기화' })).not.toBeInTheDocument()
  })

  it('지원자가 있으면 필터가 걸려 있어도 표 행만 표시', () => {
    render(
      <DocumentReviewApplicantTable
        recruitmentId="1"
        applicants={[
          {
            id: '1',
            name: '한가람',
            position: 'development',
            submittedAt: '2026-10-15T21:40',
            isEvaluated: false,
          },
        ]}
        status="all"
        totalCount={1}
        keyword="김"
        resetFilterHref={RESET_HREF}
      />,
    )

    expect(screen.getByRole('link', { name: '한가람 평가하기' })).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('검색 결과가 0명이면 포지션 필터보다 검색 안내를 먼저 표시하고, 검색어 삭제 시 검색창까지 비움', async () => {
    const user = userEvent.setup()
    const query = parseDocumentReviewQuery({ q: '홍길동', position: 'design' })
    render(
      <DocumentReviewBoard
        recruitmentId="1"
        query={query}
        statusCounts={{ all: 0, pending: 0, done: 0 }}
        positionCounts={{ design: 0, development: 0, planning: 0 }}
        currentPage={1}
        totalPages={0}
      >
        <DocumentReviewApplicantTable
          recruitmentId="1"
          applicants={[]}
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
      <DocumentReviewApplicantTable
        recruitmentId="1"
        applicants={[]}
        status="pending"
        totalCount={0}
        keyword=""
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('아직 지원자가 없어요')
    expect(screen.getByRole('button', { name: '공고 링크 복사' })).toBeInTheDocument()
  })

  it('지원자가 있는데 평가 전 탭이 0명이면 평가 결과 취합으로 이동 안내 표시', () => {
    render(
      <DocumentReviewApplicantTable
        recruitmentId="1"
        applicants={[]}
        status="pending"
        totalCount={48}
        keyword=""
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('모든 지원서 평가를 마쳤어요')
    expect(screen.getByRole('link', { name: '평가 결과 취합으로 이동' })).toHaveAttribute(
      'href',
      '/manage/recruitments/1/documents/summary',
    )
  })

  it('포지션 필터를 건 지원자가 모두 평가 완료면 필터 안내 대신 평가 모두 완료 안내 표시', () => {
    render(
      <DocumentReviewApplicantTable
        recruitmentId="1"
        applicants={[]}
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
