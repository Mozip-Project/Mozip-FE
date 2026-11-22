import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { resetMyAccount } from '@/features/user/mocks/userHandlers'
import { graphqlApi } from '@/mocks/graphqlApi'
import { server } from '@/mocks/server'
import { ToastProvider } from '@/providers/toastProvider'
import { NotificationSettings } from './notificationSettings'

function renderNotificationSettings() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <NotificationSettings />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

function failUpdateOnce() {
  server.use(
    graphqlApi.mutation(
      'UpdateNotificationSettings',
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

describe('NotificationSettings', () => {
  it('저장된 알림 설정으로 토글 상태를 채움', async () => {
    renderNotificationSettings()

    expect(await screen.findByRole('switch', { name: '지원 결과 및 면접 일정' })).toBeChecked()
    expect(screen.getByRole('switch', { name: '스크랩 공고 모집 시작' })).toBeChecked()
    expect(screen.getByRole('switch', { name: '운영진 활동 알림' })).toBeChecked()
    expect(screen.getByRole('switch', { name: '이벤트 및 마케팅' })).not.toBeChecked()
  })

  it('켜면 저장에 성공한 뒤 동의 토스트를 띄움', async () => {
    renderNotificationSettings()
    const marketing = await screen.findByRole('switch', { name: '이벤트 및 마케팅' })

    await userEvent.click(marketing)

    expect(marketing).toBeChecked()
    expect(await screen.findByText('이벤트 및 마케팅 알림 수신에 동의했어요')).toBeInTheDocument()
  })

  it('끄면 토스트 없이 저장', async () => {
    renderNotificationSettings()
    const operator = await screen.findByRole('switch', { name: '운영진 활동 알림' })

    await userEvent.click(operator)

    expect(operator).not.toBeChecked()
    expect(screen.queryByText(/수신에 동의했어요/)).not.toBeInTheDocument()
  })

  it('저장에 실패하면 토글을 되돌리고 실패 토스트를 띄움', async () => {
    failUpdateOnce()
    renderNotificationSettings()
    const scrap = await screen.findByRole('switch', { name: '스크랩 공고 모집 시작' })

    await userEvent.click(scrap)

    expect(await screen.findByText('알림 설정을 바꾸지 못했어요')).toBeInTheDocument()
    await waitFor(() => expect(scrap).toBeChecked())
  })

  it('불러오기에 실패하면 다시 시도로 알림 설정을 다시 불러옴', async () => {
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
    renderNotificationSettings()

    expect(await screen.findByRole('alert')).toHaveTextContent('알림 설정을 불러오지 못했어요')

    await userEvent.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(await screen.findByRole('switch', { name: '이벤트 및 마케팅' })).toBeInTheDocument()
  })
})
