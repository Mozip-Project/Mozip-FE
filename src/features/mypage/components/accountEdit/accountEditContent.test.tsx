import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { resetMyAccount } from '@/features/user/mocks/userHandlers'
import { graphqlApi } from '@/mocks/graphqlApi'
import { server } from '@/mocks/server'
import { ToastProvider } from '@/providers/toastProvider'
import { AccountEditContent } from './accountEditContent'

function renderAccountEdit() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AccountEditContent />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
})

afterEach(() => {
  resetMyAccount()
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('AccountEditContent', () => {
  it('내 계정 정보로 이름과 가린 현재 번호를 채움', async () => {
    renderAccountEdit()

    expect(await screen.findByRole('textbox', { name: /이름/ })).toHaveValue('김모집')
    expect(screen.getByDisplayValue('010-****-5678')).toBeInTheDocument()
  })

  it('불러오기에 실패하면 다시 시도로 계정 정보를 다시 불러옴', async () => {
    server.use(
      graphqlApi.query(
        'MyAccount',
        () =>
          HttpResponse.json({
            errors: [{ message: '서버 오류', extensions: { code: 'COMMON_500' } }],
            data: null,
          }),
        { once: true },
      ),
    )
    renderAccountEdit()

    expect(await screen.findByRole('alert')).toHaveTextContent('계정 정보를 불러오지 못했어요')
    expect(screen.getByRole('link', { name: '계정 설정' })).toHaveAttribute(
      'href',
      '/manage/mypage',
    )

    await userEvent.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(await screen.findByRole('textbox', { name: /이름/ })).toHaveValue('김모집')
  })
})
