import { fireEvent, render, screen } from '@testing-library/react'
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

  it('이모지를 한 글자로 세서 한도까지 입력 허용', async () => {
    const user = userEvent.setup()
    render(<TextArea aria-label="의견" maxLength={3} />)

    const textarea = screen.getByRole('textbox', { name: '의견' })
    await user.click(textarea)
    await user.paste('👍👍👍👍')

    expect(textarea).toHaveValue('👍👍👍')
    expect(textarea).toHaveAccessibleDescription('3/3')
  })

  it('한도에서 중간에 입력하면 기존 글자 유지', async () => {
    const user = userEvent.setup()
    render(<TextArea aria-label="의견" maxLength={3} defaultValue="abc" />)

    const textarea = screen.getByRole<HTMLTextAreaElement>('textbox', { name: '의견' })
    await user.click(textarea)
    textarea.setSelectionRange(1, 1)
    await user.paste('x')

    expect(textarea).toHaveValue('abc')
  })

  it('한글 조합 중에는 유지하고 조합이 끝나면 한도 초과분 제거', () => {
    const changedValues: string[] = []
    render(
      <TextArea
        aria-label="의견"
        maxLength={2}
        onChange={(event) => changedValues.push(event.target.value)}
      />,
    )

    const textarea = screen.getByRole('textbox', { name: '의견' })
    fireEvent.compositionStart(textarea)
    fireEvent.change(textarea, { target: { value: '가나다' } })

    expect(textarea).toHaveValue('가나다')

    fireEvent.compositionEnd(textarea)

    expect(textarea).toHaveValue('가나')
    expect(textarea).toHaveAccessibleDescription('2/2')
    // 제거한 값을 부모 onChange에도 전달
    expect(changedValues.at(-1)).toBe('가나')
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
