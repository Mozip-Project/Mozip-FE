import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ApplicantChip } from '@/components/ui/ApplicantChip/applicantChip'

describe('ApplicantChip', () => {
  it('현재 지원자는 aria-current로 표시', () => {
    render(<ApplicantChip name="김모집" isCurrent />)

    expect(screen.getByRole('button', { name: '김모집' })).toHaveAttribute('aria-current', 'true')
  })

  it('평가 완료 상태를 텍스트로 전달', () => {
    render(<ApplicantChip name="김모집" isDone />)

    expect(screen.getByRole('button', { name: '김모집 평가 완료' })).not.toHaveAttribute(
      'aria-current',
    )
  })
})
