import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ScoreRow } from '@/components/ui/ScoreRow/scoreRow'

describe('ScoreRow', () => {
  it('오류 문구를 그룹 설명으로 연결하고 invalid 표시', () => {
    render(<ScoreRow label="Q1. 지원 동기" errorMessage="점수를 선택해 주세요" />)

    const group = screen.getByRole('radiogroup', { name: 'Q1. 지원 동기' })
    expect(group).toHaveAttribute('aria-invalid', 'true')
    expect(group).toHaveAccessibleDescription('점수를 선택해 주세요')
  })
})
