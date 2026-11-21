import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { resetOrganizationProfiles } from '@/features/organization/mocks/organizationProfileHandlers'
import { graphqlApi } from '@/mocks/graphqlApi'
import { server } from '@/mocks/server'
import { ToastProvider } from '@/providers/toastProvider'
import { OrganizationProfileContent } from './organizationProfileContent'

function renderProfile(savedOrganizationId?: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <OrganizationProfileContent savedOrganizationId={savedOrganizationId} />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

function failProfileQueryOnce() {
  server.use(
    graphqlApi.query(
      'OrganizationProfile',
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
  resetOrganizationProfiles()
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('OrganizationProfileContent', () => {
  it('현재 단체의 저장된 프로필로 폼 채움', async () => {
    renderProfile()

    expect(await screen.findByRole('textbox', { name: /한 줄 소개/ })).toHaveValue(
      '사용자 경험을 연구하고 만드는 동아리',
    )
    expect(screen.getByRole('textbox', { name: '단체명' })).toHaveValue('UXUX')
    expect(screen.getByRole('button', { name: '디자인 · 미디어' })).toBeInTheDocument()
  })

  it('학생회는 활동 분야 없이 표시', async () => {
    renderProfile('2')

    expect(await screen.findByRole('textbox', { name: '단체명' })).toHaveValue('멋쟁이개발자')
    expect(screen.queryByRole('button', { name: '디자인 · 미디어' })).not.toBeInTheDocument()
  })

  it('불러오지 못하면 안내 후 다시 시도', async () => {
    const user = userEvent.setup()
    failProfileQueryOnce()
    renderProfile()

    expect(await screen.findByRole('alert')).toHaveTextContent('단체 프로필을 불러오지 못했어요')

    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(await screen.findByRole('textbox', { name: '단체명' })).toHaveValue('UXUX')
  })
})
