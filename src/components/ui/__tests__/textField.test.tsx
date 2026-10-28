import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TextField } from '@/components/ui/TextField/textField'

describe('TextField', () => {
  it('helper를 input 설명으로 연결', () => {
    render(<TextField label="이름" helper="실명을 입력해 주세요" />)

    expect(screen.getByRole('textbox', { name: '이름' })).toHaveAccessibleDescription(
      '실명을 입력해 주세요',
    )
  })

  it('외부 aria-describedby와 helper를 함께 유지', () => {
    render(
      <>
        <p id="extra">추가 설명</p>
        <TextField label="이름" helper="도움말" aria-describedby="extra" />
      </>,
    )

    expect(screen.getByRole('textbox', { name: '이름' })).toHaveAccessibleDescription(
      '추가 설명 도움말',
    )
  })

  it('required면 * 표시를 이름에서 제외하고 필수로 전달', () => {
    render(<TextField label="이름" required />)

    const input = screen.getByRole('textbox', { name: '이름' })
    expect(input).toBeRequired()
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true')
  })

  it('helper가 없으면 aria-describedby 미설정', () => {
    render(<TextField label="이름" />)

    expect(screen.getByRole('textbox', { name: '이름' })).not.toHaveAttribute('aria-describedby')
  })
})
