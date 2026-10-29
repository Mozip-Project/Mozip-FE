import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { usePointerFocus } from './usePointerFocus'

function PointerFocusButton() {
  const { isPointerFocus, markPointerFocus } = usePointerFocus()

  return (
    <button
      type="button"
      data-pointer-focus={isPointerFocus ? '' : undefined}
      onPointerDown={markPointerFocus}
    >
      첫 번째
    </button>
  )
}

function renderButtons() {
  render(
    <>
      <PointerFocusButton />
      <button type="button">두 번째</button>
    </>,
  )

  return screen.getByRole('button', { name: '첫 번째' })
}

// data-pointer-focus가 없을 때만 포커스 링 표시
describe('usePointerFocus', () => {
  it('마우스로 누르면 링 숨김 표시', async () => {
    const user = userEvent.setup()
    const button = renderButtons()

    await user.click(button)

    expect(button).toHaveFocus()
    expect(button).toHaveAttribute('data-pointer-focus')
  })

  it('Tab 키로 들어오면 링 숨김 없음', async () => {
    const user = userEvent.setup()
    const button = renderButtons()

    await user.tab()

    expect(button).toHaveFocus()
    expect(button).not.toHaveAttribute('data-pointer-focus')
  })

  it('마우스로 누른 뒤 키를 누르면 링 숨김 해제', async () => {
    const user = userEvent.setup()
    const button = renderButtons()

    await user.click(button)
    await user.keyboard('{ArrowDown}')

    expect(button).toHaveFocus()
    expect(button).not.toHaveAttribute('data-pointer-focus')
  })

  it('링 숨김 중에도 Tab 키 포커스 이동 유지', async () => {
    const user = userEvent.setup()
    const button = renderButtons()

    await user.click(button)
    await user.tab()

    expect(screen.getByRole('button', { name: '두 번째' })).toHaveFocus()
  })
})
