import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DocumentReviewApplicantTable } from './documentReviewApplicantTable'

const EMPTY_STATE = <p>빈 상태 안내</p>

describe('DocumentReviewApplicantTable', () => {
  it('지원자가 있으면 행만 표시하고 빈 상태는 숨김', () => {
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
        emptyState={EMPTY_STATE}
      />,
    )

    expect(screen.getByRole('link', { name: '한가람 평가하기' })).toHaveAttribute(
      'href',
      '/manage/recruitments/1/documents/1',
    )
    expect(screen.getByRole('cell', { name: '10/15 (목)' })).toBeInTheDocument()
    expect(screen.queryByText('빈 상태 안내')).not.toBeInTheDocument()
  })

  it('지원자가 0명이면 헤더 아래에 빈 상태 표시', () => {
    render(
      <DocumentReviewApplicantTable recruitmentId="1" applicants={[]} emptyState={EMPTY_STATE} />,
    )

    expect(screen.getAllByRole('row')).toHaveLength(1)
    expect(screen.getByText('빈 상태 안내')).toBeInTheDocument()
  })
})
