import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ScoreRow } from '@/components/ui/ScoreRow/scoreRow'

describe('ScoreRow', () => {
  it('라벨을 점수 그룹 이름으로 연결하고 1~5점 선택지를 표시', () => {
    render(<ScoreRow label="Q1. 지원 동기" />)

    const group = screen.getByRole('radiogroup', { name: 'Q1. 지원 동기' })
    expect(group).not.toHaveAttribute('aria-invalid')
    expect(screen.getAllByRole('radio')).toHaveLength(5)
  })

  it('점수 선택 시 값 전달', async () => {
    const user = userEvent.setup()
    const handleValueChange = vi.fn()
    render(<ScoreRow label="Q1. 지원 동기" onValueChange={handleValueChange} />)

    await user.click(screen.getByRole('radio', { name: '4' }))

    expect(handleValueChange).toHaveBeenCalledWith('4')
  })

  it('오류 문구를 그룹 설명으로 연결하고 invalid 표시', () => {
    render(<ScoreRow label="Q1. 지원 동기" errorMessage="점수를 선택해 주세요" />)

    const group = screen.getByRole('radiogroup', { name: 'Q1. 지원 동기' })
    expect(group).toHaveAttribute('aria-invalid', 'true')
    expect(group).toHaveAccessibleDescription('점수를 선택해 주세요')
  })
})
