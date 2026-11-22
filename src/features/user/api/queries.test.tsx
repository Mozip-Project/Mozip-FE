import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { resetMyAccount } from '@/features/user/mocks/userHandlers'
import type {
  MyAccountFieldsFragment,
  MyAccountQuery,
  MyAccountQueryVariables,
  UpdateNotificationSettingsMutation,
  UpdateNotificationSettingsMutationVariables,
} from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { server } from '@/mocks/server'
import { userKeys } from './keys'
import {
  useMyAccountQuery,
  useUpdateNotificationSettingMutation,
  useUpdateProfileMutation,
} from './queries'
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

// 서버는 요청이 도착한 순서로 처리하고, 응답 도착 순서는 테스트가 releases로 정함
function holdNotificationSettingResponses(initialAccount: MyAccountFieldsFragment) {
  const releases: Array<() => void> = []
  let serverSettings = { ...initialAccount.notificationSettings }

  server.use(
    graphqlApi.mutation<
      UpdateNotificationSettingsMutation,
      UpdateNotificationSettingsMutationVariables
    >('UpdateNotificationSettings', async ({ variables }) => {
      serverSettings = {
        notifyResult: variables.input.notifyResult ?? serverSettings.notifyResult,
        notifyScrap: variables.input.notifyScrap ?? serverSettings.notifyScrap,
        notifyOperator: variables.input.notifyOperator ?? serverSettings.notifyOperator,
        marketingAgreed: variables.input.marketingAgreed ?? serverSettings.marketingAgreed,
      }
      const processedSettings = serverSettings
      await new Promise<void>((resolve) => releases.push(resolve))
      return HttpResponse.json({
        data: {
          updateNotificationSettings: {
            ...initialAccount,
            notificationSettings: processedSettings,
          },
        },
      })
    }),
    graphqlApi.query<MyAccountQuery, MyAccountQueryVariables>('MyAccount', () =>
      HttpResponse.json({
        data: { me: { ...initialAccount, notificationSettings: serverSettings } },
      }),
    ),
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

  it('나중에 처리된 응답이 먼저 도착해도 늦게 온 앞선 응답으로 되돌아가지 않음', async () => {
    const { result, queryClient, initialAccount } = await renderLoadedHooks()
    const releases = holdNotificationSettingResponses(initialAccount)

    // 서버 처리 순서를 A(스크랩) → B(마케팅)로 고정
    act(() => result.current.mutation.mutate({ key: 'notifyScrap', isEnabled: false }))
    await waitFor(() => expect(releases).toHaveLength(1))
    act(() => result.current.mutation.mutate({ key: 'marketingAgreed', isEnabled: true }))
    await waitFor(() => expect(releases).toHaveLength(2))

    // B 응답이 먼저, B 반영 전 값을 담은 A 응답이 마지막에 도착
    act(() => releases[1]?.())
    await waitFor(() => expect(queryClient.isMutating()).toBe(1))
    act(() => releases[0]?.())
    await waitFor(() => expect(queryClient.isMutating()).toBe(0))

    expect(getSettings(result.current.account.data)).toMatchObject({
      notifyScrap: false,
      marketingAgreed: true,
    })
  })
})

describe('useUpdateProfileMutation', () => {
  it('저장 응답으로 계정 설정 캐시를 바로 갱신', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    function Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    }

    const { result } = renderHook(
      () => ({ account: useMyAccountQuery(), mutation: useUpdateProfileMutation() }),
      { wrapper: Wrapper },
    )
    await waitFor(() => expect(result.current.account.isSuccess).toBe(true))

    act(() => result.current.mutation.mutate({ name: '이모집' }))

    await waitFor(() => expect(result.current.account.data?.name).toBe('이모집'))
  })
  it('저장 전에 시작된 조회가 늦게 도착해도 저장한 값을 이전 값으로 덮지 않음', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    function Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    }

    const { result } = renderHook(
      () => ({ account: useMyAccountQuery(), mutation: useUpdateProfileMutation() }),
      { wrapper: Wrapper },
    )
    await waitFor(() => expect(result.current.account.isSuccess).toBe(true))
    const staleAccount = result.current.account.data

    let releaseRefetch = () => {}
    server.use(
      graphqlApi.query('MyAccount', async () => {
        await new Promise<void>((resolve) => {
          releaseRefetch = resolve
        })
        return HttpResponse.json({ data: { me: staleAccount } })
      }),
    )
    // 조회 중 여부는 렌더링 추적과 무관하게 QueryClient에서 직접 확인
    const isAccountFetching = () => queryClient.isFetching({ queryKey: userKeys.myAccount }) > 0
    act(() => void result.current.account.refetch())
    await waitFor(() => expect(isAccountFetching()).toBe(true))

    act(() => result.current.mutation.mutate({ name: '이모집' }))
    await waitFor(() => expect(result.current.mutation.isSuccess).toBe(true))
    act(() => releaseRefetch())

    await waitFor(() => expect(isAccountFetching()).toBe(false))
    expect(queryClient.getQueryData<MyAccountFieldsFragment>(userKeys.myAccount)?.name).toBe(
      '이모집',
    )
  })
})
