import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { MOCK_VERIFICATION_CODE, resetAccountEdit } from '@/features/user/mocks/accountEditHandlers'
import { getMockAccount, resetMyAccount } from '@/features/user/mocks/userHandlers'
import { graphqlApi } from '@/mocks/graphqlApi'
import { server } from '@/mocks/server'
import { ToastProvider } from '@/providers/toastProvider'
import { AccountEditForm } from './accountEditForm'

function renderAccountEditForm() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AccountEditForm name="김모집" maskedPhone="010-****-5678" />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

// 응답 시점을 테스트가 정하도록 요청을 붙잡고, 풀면 성공 응답 반환
function holdMutation(operationName: string, data: Record<string, unknown>) {
  let release = () => {}
  server.use(
    graphqlApi.mutation(operationName, async () => {
      await new Promise<void>((resolve) => {
        release = resolve
      })
      return HttpResponse.json({ data })
    }),
  )
  return () => release()
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

describe('AccountEditForm 새 비밀번호 확인', () => {
  it('확인 칸 입력이 멈추면 불일치를 칸을 벗어나지 않아도 표시', async () => {
    const user = userEvent.setup()
    renderAccountEditForm()
    const confirm = screen.getByLabelText(/새 비밀번호 확인/)

    await user.type(screen.getByLabelText(/^새 비밀번호(?! 확인)/), 'abcd1234!')
    await user.type(confirm, 'abcd1234@')

    expect(confirm).toHaveAttribute('aria-invalid', 'false')
    await waitFor(() => expect(confirm).toHaveAttribute('aria-invalid', 'true'))
    expect(confirm).toHaveFocus()
    expect(screen.getByText('비밀번호가 일치하지 않습니다')).toBeInTheDocument()
  })

  it('새 비밀번호를 고쳐 확인 칸과 같아지면 입력이 멈춘 뒤 일치로 바뀜', async () => {
    const user = userEvent.setup()
    renderAccountEditForm()
    const newPassword = screen.getByLabelText(/^새 비밀번호(?! 확인)/)
    const confirm = screen.getByLabelText(/새 비밀번호 확인/)

    await user.type(newPassword, 'abcd1234!')
    await user.type(confirm, 'abcd1234@')
    await waitFor(() => expect(confirm).toHaveAttribute('aria-invalid', 'true'))

    await user.clear(newPassword)
    await user.type(newPassword, 'abcd1234@')

    await waitFor(() => expect(confirm).toHaveAttribute('aria-invalid', 'false'))
    expect(screen.getByText('비밀번호가 일치해요')).toBeInTheDocument()
  })

  it('확인 칸을 거친 뒤 새 비밀번호를 고쳐도 타이핑 중에는 불일치를 바로 띄우지 않음', async () => {
    const user = userEvent.setup()
    renderAccountEditForm()
    const newPassword = screen.getByLabelText(/^새 비밀번호(?! 확인)/)
    const confirm = screen.getByLabelText(/새 비밀번호 확인/)

    await user.type(newPassword, 'abcd1234!')
    await user.type(confirm, 'abcd1234!')
    await user.tab()
    await user.click(newPassword)
    await user.type(newPassword, 'x')

    expect(confirm).toHaveAttribute('aria-invalid', 'false')
    await waitFor(() => expect(confirm).toHaveAttribute('aria-invalid', 'true'))
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

  it('인증번호 확인 중에는 번호를 바꾸거나 다시 받을 수 없음', async () => {
    const user = userEvent.setup()
    renderAccountEditForm()
    const newPhone = screen.getByLabelText(/새 휴대폰 번호/)

    await user.type(newPhone, '01098765432')
    await user.click(screen.getByRole('button', { name: '인증번호 받기' }))
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('인증번호가 발송되었습니다.'),
    )
    const releaseVerify = holdMutation('VerifyPhoneChange', { verifyPhoneChange: true })
    await user.type(screen.getByLabelText(/인증번호 입력/), MOCK_VERIFICATION_CODE)
    await user.click(screen.getByRole('button', { name: '확인' }))

    await waitFor(() => expect(newPhone).toBeDisabled())
    expect(screen.getByRole('button', { name: '인증번호 받기' })).toBeDisabled()

    releaseVerify()
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('인증이 완료되었습니다.'),
    )
  })
})

describe('AccountEditForm 저장', () => {
  async function typeNewPassword(user: ReturnType<typeof userEvent.setup>, current: string) {
    await user.type(screen.getByLabelText(/현재 비밀번호/), current)
    await user.type(screen.getByLabelText(/^새 비밀번호(?! 확인)/), 'newpass123!')
    await user.type(screen.getByLabelText(/새 비밀번호 확인/), 'newpass123!')
  }

  it('바꾼 이름을 저장하면 완료 토스트를 띄우고 서버 값이 바뀜', async () => {
    const user = userEvent.setup()
    renderAccountEditForm()
    const name = screen.getByLabelText(/이름/)

    await user.clear(name)
    await user.type(name, '이모집')
    await user.click(screen.getByRole('button', { name: '저장' }))

    expect(await screen.findByText('정보를 저장했어요')).toBeInTheDocument()
    expect(getMockAccount().name).toBe('이모집')
  })

  it('인증한 번호를 저장하면 숫자만 보내 서버 번호가 바뀜', async () => {
    const user = userEvent.setup()
    renderAccountEditForm()

    await user.type(screen.getByLabelText(/새 휴대폰 번호/), '01098765432')
    await user.click(screen.getByRole('button', { name: '인증번호 받기' }))
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('인증번호가 발송되었습니다.'),
    )
    await user.type(screen.getByLabelText(/인증번호 입력/), MOCK_VERIFICATION_CODE)
    await user.click(screen.getByRole('button', { name: '확인' }))
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('인증이 완료되었습니다.'),
    )
    await user.click(screen.getByRole('button', { name: '저장' }))

    expect(await screen.findByText('정보를 저장했어요')).toBeInTheDocument()
    expect(getMockAccount().phone).toBe('01098765432')
  })

  it('현재 비밀번호가 틀리면 그 칸에 표시하고 이름도 저장하지 않음', async () => {
    const user = userEvent.setup()
    renderAccountEditForm()
    const name = screen.getByLabelText(/이름/)

    await user.clear(name)
    await user.type(name, '이모집')
    await typeNewPassword(user, 'wrong-password1!')
    await user.click(screen.getByRole('button', { name: '저장' }))

    await waitFor(() =>
      expect(screen.getByLabelText(/현재 비밀번호/)).toHaveAttribute('aria-invalid', 'true'),
    )
    expect(screen.getByText('휴대폰 번호 또는 비밀번호가 일치하지 않습니다.')).toBeInTheDocument()
    expect(getMockAccount().name).toBe('김모집')
  })

  it('비밀번호만 바뀌고 프로필 저장이 실패하면 비밀번호 변경 사실을 알림', async () => {
    const user = userEvent.setup()
    server.use(
      graphqlApi.mutation('UpdateProfile', () =>
        HttpResponse.json({
          errors: [{ message: '서버 오류', extensions: { code: 'COMMON_500' } }],
          data: null,
        }),
      ),
    )
    renderAccountEditForm()
    const name = screen.getByLabelText(/이름/)

    await user.clear(name)
    await user.type(name, '이모집')
    await typeNewPassword(user, 'mozip1234!')
    await user.click(screen.getByRole('button', { name: '저장' }))

    expect(
      await screen.findByText('비밀번호만 변경하고 나머지는 저장하지 못했어요'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/현재 비밀번호/)).toHaveValue('')
  })
  it('저장 중에는 입력을 잠가 응답 뒤 초기화로 입력이 사라지지 않게 함', async () => {
    const user = userEvent.setup()
    const releaseSave = holdMutation('UpdateProfile', {
      updateProfile: { ...getMockAccount(), name: '이모집' },
    })
    renderAccountEditForm()
    const name = screen.getByLabelText(/이름/)

    await user.clear(name)
    await user.type(name, '이모집')
    await user.click(screen.getByRole('button', { name: '저장' }))

    await waitFor(() => expect(name).toBeDisabled())
    expect(screen.getByLabelText(/현재 비밀번호/)).toBeDisabled()

    releaseSave()
    expect(await screen.findByText('정보를 저장했어요')).toBeInTheDocument()
    expect(name).toBeEnabled()
  })
})
