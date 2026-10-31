import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  ApplicantRow,
  ApplicantSkeletonRow,
  ApplicantTable,
  ApplicantTableHead,
} from './applicantTable'

describe('ApplicantTable', () => {
  it('지원자 정보를 표의 행으로 표시', () => {
    render(
      <ApplicantTable label="지원자 목록">
        <ApplicantTableHead />
        <ApplicantRow href="/" name="김모집" position="디자인" submittedAt="10.10" />
      </ApplicantTable>,
    )

    expect(screen.getByRole('table', { name: '지원자 목록' })).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
      '지원자',
      '포지션',
      '제출일',
      '평가',
    ])
    expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual([
      '김모집',
      '디자인',
      '10.10',
      '평가하기',
    ])
  })

  it('평가 전에는 평가하기, 평가 후에는 평가 수정 링크로 이동', () => {
    render(
      <ApplicantTable label="지원자 목록">
        <ApplicantRow href="/" name="김모집" position="디자인" submittedAt="10.10" />
        <ApplicantRow href="/" name="이모집" position="개발" submittedAt="10.11" isEvaluated />
      </ApplicantTable>,
    )

    expect(screen.getByRole('link', { name: '김모집 평가하기' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: '이모집 평가 수정' })).toHaveAttribute('href', '/')
  })

  it('로딩 중에는 표를 busy로 알리고 스켈레톤 행은 보조기술에서 제외', () => {
    render(
      <ApplicantTable label="지원자 목록" isLoading>
        <ApplicantTableHead />
        <ApplicantSkeletonRow />
      </ApplicantTable>,
    )

    expect(screen.getByRole('table', { name: '지원자 목록' })).toHaveAttribute('aria-busy', 'true')
    expect(screen.getAllByRole('row')).toHaveLength(1)
  })
})
