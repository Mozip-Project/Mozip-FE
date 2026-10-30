import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { TextArea } from '@/components/ui/TextArea/textArea'

function ControlledTextArea() {
  const [value, setValue] = useState('안녕')

  return (
    <TextArea
      aria-label="의견"
      maxLength={10}
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  )
}

describe('TextArea', () => {
  it('입력할 때마다 글자 수 갱신', async () => {
    const user = userEvent.setup()
    render(<TextArea aria-label="의견" maxLength={300} />)

    const textarea = screen.getByRole('textbox', { name: '의견' })
    expect(textarea).toHaveAccessibleDescription('0/300')

    await user.type(textarea, 'abc')

    expect(textarea).toHaveAccessibleDescription('3/300')
  })

  it('controlled value 길이로 글자 수 표시', async () => {
    const user = userEvent.setup()
    render(<ControlledTextArea />)

    const textarea = screen.getByRole('textbox', { name: '의견' })
    expect(textarea).toHaveAccessibleDescription('2/10')

    await user.type(textarea, '하세요')

    expect(textarea).toHaveAccessibleDescription('5/10')
  })

  it('한도를 넘는 입력 차단', async () => {
    const user = userEvent.setup()
    render(<TextArea aria-label="의견" maxLength={3} />)

    const textarea = screen.getByRole('textbox', { name: '의견' })
    await user.type(textarea, 'abcdef')

    expect(textarea).toHaveValue('abc')
    expect(textarea).toHaveAccessibleDescription('3/3')
  })

  it('외부 aria-describedby와 글자 수를 함께 연결', () => {
    render(
      <>
        <p id="guide">면접 의견을 남겨 주세요</p>
        <TextArea aria-label="의견" maxLength={300} aria-describedby="guide" />
      </>,
    )

    expect(screen.getByRole('textbox', { name: '의견' })).toHaveAccessibleDescription(
      '면접 의견을 남겨 주세요 0/300',
    )
  })

  it('maxLength가 없으면 글자 수 미표시', () => {
    render(<TextArea aria-label="의견" />)

    expect(screen.getByRole('textbox', { name: '의견' })).not.toHaveAttribute('aria-describedby')
  })
})
