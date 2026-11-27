import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { resetMyAccount } from '@/features/user/mocks/userHandlers'
import type { MyAccountQuery } from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { server } from '@/mocks/server'
import { ToastProvider } from '@/providers/toastProvider'
import { AccountSettingsContent } from './accountSettingsContent'

function renderAccountSettings() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AccountSettingsContent mode="organizer" />
      </ToastProvider>
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

// jsdom은 페이지 이동 미지원이라 assign만 대체
function stubLocationAssign() {
  const assign = vi.fn()
  vi.stubGlobal('location', { ...window.location, assign })
  return assign
}

async function openWithdrawalDialog() {
  await userEvent.click(await screen.findByRole('button', { name: '회원 탈퇴' }))
  const dialog = await screen.findByRole('dialog')
  await userEvent.click(within(dialog).getByRole('checkbox', { name: '안내를 확인했어요' }))
  return dialog
}

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
})

afterEach(() => {
  resetMyAccount()
  vi.unstubAllGlobals()
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
    expect(screen.getByText('한국대학생IT경영학회')).toBeInTheDocument()
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
              profileImageUrl: null,
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

  it.each(['새 단체 등록', '기존 단체 대표 인수'])(
    '%s 버튼을 누르면 준비 중 안내',
    async (buttonName) => {
      renderAccountSettings()

      await userEvent.click(await screen.findByRole('button', { name: buttonName }))

      expect(await screen.findByText('준비 중인 기능이에요')).toBeInTheDocument()
    },
  )

  it('로그아웃하면 로그아웃 홈으로 이동', async () => {
    const assign = stubLocationAssign()
    renderAccountSettings()

    await userEvent.click(await screen.findByRole('button', { name: '로그아웃' }))

    await vi.waitFor(() => expect(assign).toHaveBeenCalledWith('/'))
  })

  it('로그아웃이 AUTH_006으로 실패하면 이동하지 않고 실패 토스트', async () => {
    const assign = stubLocationAssign()
    server.use(
      http.post('*/auth/logout', () =>
        HttpResponse.json(
          {
            success: false,
            code: 'AUTH_006',
            message: '로그인 처리를 잠시 할 수 없습니다. 잠시 후 다시 시도해 주세요.',
            data: null,
          },
          { status: 503 },
        ),
      ),
    )
    renderAccountSettings()

    await userEvent.click(await screen.findByRole('button', { name: '로그아웃' }))

    expect(await screen.findByText('로그아웃하지 못했어요')).toBeInTheDocument()
    expect(assign).not.toHaveBeenCalled()
  })

  it('안내를 확인하고 탈퇴하면 로그아웃 홈으로 이동', async () => {
    const assign = stubLocationAssign()
    renderAccountSettings()
    const dialog = await openWithdrawalDialog()

    await userEvent.click(within(dialog).getByRole('button', { name: '탈퇴하기' }))

    await vi.waitFor(() => expect(assign).toHaveBeenCalledWith('/'))
  })

  it('대표자로 있는 단체가 남아 탈퇴에 실패하면 다이얼로그에 서버 안내 표시', async () => {
    const assign = stubLocationAssign()
    server.use(
      graphqlApi.mutation('Withdraw', () =>
        HttpResponse.json({
          errors: [
            {
              message: '대표자로 있는 단체가 있어 탈퇴할 수 없습니다.',
              extensions: { code: 'USER_409' },
            },
          ],
          data: null,
        }),
      ),
    )
    renderAccountSettings()
    const dialog = await openWithdrawalDialog()

    await userEvent.click(within(dialog).getByRole('button', { name: '탈퇴하기' }))

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      '대표자로 있는 단체가 있어 탈퇴할 수 없습니다.',
    )
    expect(assign).not.toHaveBeenCalled()
  })

  it('탈퇴 요청 중에는 Esc·바깥 클릭으로 닫히지 않아 다시 열어 중복 요청할 수 없음', async () => {
    stubLocationAssign()
    let withdrawRequestCount = 0
    let releaseWithdraw = () => {}
    server.use(
      graphqlApi.mutation('Withdraw', async () => {
        withdrawRequestCount += 1
        await new Promise<void>((resolve) => {
          releaseWithdraw = resolve
        })
        return HttpResponse.json({ data: { withdraw: true } })
      }),
    )
    renderAccountSettings()
    const dialog = await openWithdrawalDialog()

    await userEvent.click(within(dialog).getByRole('button', { name: '탈퇴하기' }))
    await waitFor(() => expect(withdrawRequestCount).toBe(1))
    await userEvent.keyboard('{Escape}')
    // 모달이 열리면 body는 pointer-events: none이라 실제 바깥 영역인 오버레이 클릭
    const overlay = document.querySelector('[data-slot="dialog-overlay"]')
    if (!(overlay instanceof HTMLElement)) {
      throw new Error('다이얼로그 오버레이 없음')
    }
    await userEvent.click(overlay)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: '탈퇴하기' })).toBeDisabled()
    expect(withdrawRequestCount).toBe(1)
    releaseWithdraw()
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
