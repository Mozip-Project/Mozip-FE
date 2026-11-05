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

  it('호출자 설명과 오류 설명을 함께 연결', () => {
    render(
      <>
        <p id="score-guide">1점은 부족, 5점은 매우 우수</p>
        <ScoreRow
          label="Q1. 지원 동기"
          errorMessage="점수를 선택해 주세요"
          aria-describedby="score-guide"
          aria-invalid={false}
        />
      </>,
    )

    const group = screen.getByRole('radiogroup', { name: 'Q1. 지원 동기' })
    expect(group).toHaveAttribute('aria-invalid', 'true')
    expect(group).toHaveAccessibleDescription('1점은 부족, 5점은 매우 우수 점수를 선택해 주세요')
  })
})
