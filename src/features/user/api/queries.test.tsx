import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { resetMyAccount } from '@/features/user/mocks/userHandlers'
import type {
  MyAccountFieldsFragment,
  UpdateNotificationSettingsMutation,
  UpdateNotificationSettingsMutationVariables,
} from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { server } from '@/mocks/server'
import { useMyAccountQuery, useUpdateNotificationSettingMutation } from './queries'
import type { ReactNode } from 'react'

function renderNotificationSettingHooks() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  const { result } = renderHook(
    () => ({ account: useMyAccountQuery(), mutation: useUpdateNotificationSettingMutation() }),
    { wrapper: Wrapper },
  )
  return { result, queryClient }
}

async function renderLoadedHooks() {
  const rendered = renderNotificationSettingHooks()
  await waitFor(() => expect(rendered.result.current.account.isSuccess).toBe(true))

  const initialAccount = rendered.result.current.account.data
  if (!initialAccount) {
    throw new Error('계정 설정 조회 결과 없음')
  }
  return { ...rendered, initialAccount }
}

function getSettings(account: MyAccountFieldsFragment | undefined) {
  return account?.notificationSettings
}

// 응답 시점을 테스트가 정하도록 요청을 붙잡고, 풀어 줄 때 그때까지의 서버 값을 반환
function holdNotificationSettingResponses(initialAccount: MyAccountFieldsFragment) {
  const releases: Array<() => void> = []
  let serverSettings = { ...initialAccount.notificationSettings }

  server.use(
    graphqlApi.mutation<
      UpdateNotificationSettingsMutation,
      UpdateNotificationSettingsMutationVariables
    >('UpdateNotificationSettings', async ({ variables }) => {
      await new Promise<void>((resolve) => releases.push(resolve))
      serverSettings = {
        notifyResult: variables.input.notifyResult ?? serverSettings.notifyResult,
        notifyScrap: variables.input.notifyScrap ?? serverSettings.notifyScrap,
        notifyOperator: variables.input.notifyOperator ?? serverSettings.notifyOperator,
        marketingAgreed: variables.input.marketingAgreed ?? serverSettings.marketingAgreed,
      }
      return HttpResponse.json({
        data: {
          updateNotificationSettings: { ...initialAccount, notificationSettings: serverSettings },
        },
      })
    }),
  )
  return releases
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

describe('useUpdateNotificationSettingMutation', () => {
  it('응답 전에 토글 값을 바로 반영하고 성공 응답으로 맞춤', async () => {
    const { result, initialAccount } = await renderLoadedHooks()
    const releases = holdNotificationSettingResponses(initialAccount)

    act(() => result.current.mutation.mutate({ key: 'marketingAgreed', isEnabled: true }))

    await waitFor(() =>
      expect(getSettings(result.current.account.data)?.marketingAgreed).toBe(true),
    )
    expect(result.current.mutation.isPending).toBe(true)

    await waitFor(() => expect(releases).toHaveLength(1))
    act(() => releases[0]?.())

    await waitFor(() => expect(result.current.mutation.isSuccess).toBe(true))
    expect(getSettings(result.current.account.data)?.marketingAgreed).toBe(true)
  })

  it('실패하면 바꾼 토글만 원래 값으로 되돌림', async () => {
    const { result } = await renderLoadedHooks()
    server.use(
      graphqlApi.mutation('UpdateNotificationSettings', () =>
        HttpResponse.json({
          errors: [
            { message: '서버 내부 오류가 발생했습니다.', extensions: { code: 'COMMON_500' } },
          ],
          data: null,
        }),
      ),
    )

    act(() => result.current.mutation.mutate({ key: 'notifyScrap', isEnabled: false }))

    await waitFor(() => expect(result.current.mutation.isError).toBe(true))
    expect(getSettings(result.current.account.data)).toEqual({
      notifyResult: true,
      notifyScrap: true,
      notifyOperator: true,
      marketingAgreed: false,
    })
  })

  it('연달아 바꾸면 먼저 온 응답이 나중에 바꾼 토글을 덮지 않음', async () => {
    const { result, queryClient, initialAccount } = await renderLoadedHooks()
    const releases = holdNotificationSettingResponses(initialAccount)

    act(() => result.current.mutation.mutate({ key: 'notifyScrap', isEnabled: false }))
    act(() => result.current.mutation.mutate({ key: 'marketingAgreed', isEnabled: true }))
    await waitFor(() => expect(releases).toHaveLength(2))

    // 첫 응답에는 두 번째 변경이 아직 없음
    act(() => releases[0]?.())
    await waitFor(() => expect(queryClient.isMutating()).toBe(1))
    expect(getSettings(result.current.account.data)).toMatchObject({
      notifyScrap: false,
      marketingAgreed: true,
    })

    act(() => releases[1]?.())
    await waitFor(() => expect(queryClient.isMutating()).toBe(0))
    expect(getSettings(result.current.account.data)).toMatchObject({
      notifyScrap: false,
      marketingAgreed: true,
    })
  })
})
