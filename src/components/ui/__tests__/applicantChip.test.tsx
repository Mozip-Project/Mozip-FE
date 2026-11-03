import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
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

  it('클릭 시 핸들러 호출', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<ApplicantChip name="김모집" onClick={handleClick} />)

    await user.click(screen.getByRole('button', { name: '김모집' }))

    expect(handleClick).toHaveBeenCalledOnce()
  })
})
