import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { AccountEditContent } from './accountEditContent'

describe('AccountEditContent 비밀번호 검증', () => {
  it('현재 비밀번호를 비우면 다른 칸에 남은 오류가 사라지고 저장 가능', async () => {
    const user = userEvent.setup()
    render(<AccountEditContent />)
    const currentPassword = screen.getByLabelText(/현재 비밀번호/)
    const newPassword = screen.getByLabelText(/^새 비밀번호(?! 확인)/)

    await user.type(currentPassword, 'abc')
    await user.click(screen.getByRole('button', { name: '저장' }))
    expect(newPassword).toHaveAttribute('aria-invalid', 'true')

    await user.clear(currentPassword)
    await user.type(screen.getByLabelText(/이름/), '수정')

    expect(newPassword).toHaveAttribute('aria-invalid', 'false')
    expect(screen.getByRole('button', { name: '저장' })).toBeEnabled()
  })

  it('새 비밀번호만 입력해도 아직 건드리지 않은 확인 칸에 오류가 미리 뜨지 않음', async () => {
    const user = userEvent.setup()
    render(<AccountEditContent />)

    await user.type(screen.getByLabelText(/^새 비밀번호(?! 확인)/), 'abcd1234!')

    expect(screen.getByLabelText(/새 비밀번호 확인/)).toHaveAttribute('aria-invalid', 'false')
  })
})
