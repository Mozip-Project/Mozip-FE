import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { resetMyAccount } from '@/features/user/mocks/userHandlers'
import type { MyAccountQuery } from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { server } from '@/mocks/server'
import { AccountSettingsContent } from './accountSettingsContent'

function renderAccountSettings() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <QueryClientProvider client={queryClient}>
      <AccountSettingsContent />
    </QueryClientProvider>,
  )
}

function failMyAccountQueryOnce() {
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

describe('AccountSettingsContent', () => {
  it('내 계정 정보로 프로필·학교 인증·소속 단체를 채움', async () => {
    renderAccountSettings()

    expect(await screen.findByText('김모집')).toBeInTheDocument()
    expect(screen.getByText('010-****-5678')).toBeInTheDocument()
    expect(screen.getByText('모집대학교')).toBeInTheDocument()
    expect(screen.getByText('mozip@mozip.ac.kr')).toBeInTheDocument()
    expect(screen.getByText('UXUX')).toBeInTheDocument()
    expect(screen.getByText('대표자')).toBeInTheDocument()
    expect(screen.getByText('멋쟁이개발자')).toBeInTheDocument()
  })

  it('재학증명서로 인증해 이메일이 없으면 인증 이메일 줄 숨김', async () => {
    server.use(
      graphqlApi.query<MyAccountQuery>('MyAccount', () =>
        HttpResponse.json({
          data: {
            me: {
              id: 'user-1',
              phone: '01012345678',
              name: '김모집',
              school: null,
              schoolVerification: { schoolName: '직접입력대학교', email: null, school: null },
              memberships: [],
              notificationSettings: {
                notifyResult: true,
                notifyScrap: true,
                notifyOperator: true,
                marketingAgreed: false,
              },
            },
          },
        }),
      ),
    )
    renderAccountSettings()

    expect(await screen.findByText('직접입력대학교')).toBeInTheDocument()
    expect(screen.queryByText('인증 이메일')).not.toBeInTheDocument()
  })

  it('불러오기에 실패하면 다시 시도로 계정 정보를 다시 불러옴', async () => {
    failMyAccountQueryOnce()
    renderAccountSettings()

    expect(await screen.findByRole('alert')).toHaveTextContent('계정 정보를 불러오지 못했어요')
    expect(screen.getByRole('button', { name: '회원 탈퇴' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(await screen.findByText('김모집')).toBeInTheDocument()
  })
})
