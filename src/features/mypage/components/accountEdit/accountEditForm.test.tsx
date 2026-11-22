import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { MOCK_VERIFICATION_CODE, resetAccountEdit } from '@/features/user/mocks/accountEditHandlers'
import { resetMyAccount } from '@/features/user/mocks/userHandlers'
import { AccountEditForm } from './accountEditForm'

function renderAccountEditForm() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <QueryClientProvider client={queryClient}>
      <AccountEditForm name="김모집" maskedPhone="010-****-5678" />
    </QueryClientProvider>,
  )
}

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
})

afterEach(() => {
  resetMyAccount()
  resetAccountEdit()
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('AccountEditForm 비밀번호 검증', () => {
  it('현재 비밀번호를 비우면 다른 칸에 남은 오류가 사라지고 저장 가능', async () => {
    const user = userEvent.setup()
    renderAccountEditForm()
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
    renderAccountEditForm()

    await user.type(screen.getByLabelText(/^새 비밀번호(?! 확인)/), 'abcd1234!')

    expect(screen.getByLabelText(/새 비밀번호 확인/)).toHaveAttribute('aria-invalid', 'false')
  })
})

describe('AccountEditForm 휴대폰 번호 인증', () => {
  it('인증번호를 받아 확인하면 인증 완료로 바뀌고 저장 가능', async () => {
    const user = userEvent.setup()
    renderAccountEditForm()

    await user.type(screen.getByLabelText(/새 휴대폰 번호/), '01098765432')
    await user.click(screen.getByRole('button', { name: '인증번호 받기' }))
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('인증번호가 발송되었습니다.'),
    )
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled()

    await user.type(screen.getByLabelText(/인증번호 입력/), MOCK_VERIFICATION_CODE)
    await user.click(screen.getByRole('button', { name: '확인' }))

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('인증이 완료되었습니다.'),
    )
    expect(screen.getByRole('button', { name: '저장' })).toBeEnabled()
  })

  it('이미 가입된 번호면 새 휴대폰 번호 칸에 서버 안내를 표시하고 고치면 지움', async () => {
    const user = userEvent.setup()
    renderAccountEditForm()
    const newPhone = screen.getByLabelText(/새 휴대폰 번호/)

    await user.type(newPhone, '01000000002')
    await user.click(screen.getByRole('button', { name: '인증번호 받기' }))

    expect(await screen.findByText('이미 가입된 휴대폰 번호입니다.')).toBeInTheDocument()
    expect(newPhone).toHaveAttribute('aria-invalid', 'true')

    await user.type(newPhone, '{backspace}')

    expect(screen.queryByText('이미 가입된 휴대폰 번호입니다.')).not.toBeInTheDocument()
    expect(newPhone).toHaveAttribute('aria-invalid', 'false')
  })

  it('인증번호가 틀리면 인증번호 칸에 서버 안내를 표시하고 인증하지 않음', async () => {
    const user = userEvent.setup()
    renderAccountEditForm()

    await user.type(screen.getByLabelText(/새 휴대폰 번호/), '01098765432')
    await user.click(screen.getByRole('button', { name: '인증번호 받기' }))
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('인증번호가 발송되었습니다.'),
    )
    const code = screen.getByLabelText(/인증번호 입력/)

    await user.type(code, '000000')
    await user.click(screen.getByRole('button', { name: '확인' }))

    expect(
      await screen.findByText('인증번호가 일치하지 않거나 만료되었습니다.'),
    ).toBeInTheDocument()
    expect(code).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled()
  })
})
