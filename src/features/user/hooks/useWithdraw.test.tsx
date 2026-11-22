import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { graphqlApi } from '@/mocks/graphqlApi'
import { server } from '@/mocks/server'
import { useWithdraw } from './useWithdraw'
import type { ReactNode } from 'react'

function renderWithdrawHook() {
  const queryClient = new QueryClient()

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  return renderHook(() => useWithdraw(), { wrapper: Wrapper })
}

// jsdom은 페이지 이동 미지원이라 assign만 대체
function stubLocationAssign() {
  const assign = vi.fn()
  vi.stubGlobal('location', { ...window.location, assign })
  return assign
}

// 로그아웃 요청 횟수 확인용, 응답은 지정한 상태로 반환
function countLogoutRequests(status = 200) {
  let count = 0
  server.use(
    http.post('*/auth/logout', () => {
      count += 1
      return status === 200
        ? HttpResponse.json({
            success: true,
            code: 'OK',
            message: '요청이 성공했습니다.',
            data: null,
          })
        : HttpResponse.json(
            {
              success: false,
              code: 'AUTH_006',
              message: '잠시 후 다시 시도해 주세요.',
              data: null,
            },
            { status },
          )
    }),
  )
  return () => count
}

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
})

afterEach(() => {
  vi.unstubAllGlobals()
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('useWithdraw', () => {
  it('탈퇴하면 로그아웃까지 호출한 뒤 로그아웃 홈으로 새로고침 이동', async () => {
    const assign = stubLocationAssign()
    const getLogoutCount = countLogoutRequests()
    const { result } = renderWithdrawHook()

    act(() => result.current.mutate())

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getLogoutCount()).toBe(1)
    expect(assign).toHaveBeenCalledWith('/')
  })

  it('탈퇴 뒤 로그아웃이 실패해도 탈퇴는 끝났으므로 이동', async () => {
    const assign = stubLocationAssign()
    const getLogoutCount = countLogoutRequests(503)
    const { result } = renderWithdrawHook()

    act(() => result.current.mutate())

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getLogoutCount()).toBe(1)
    expect(assign).toHaveBeenCalledWith('/')
  })

  it('USER_409면 로그아웃하지 않고 이동 없이 오류 전달', async () => {
    const assign = stubLocationAssign()
    const getLogoutCount = countLogoutRequests()
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
    const { result } = renderWithdrawHook()

    act(() => result.current.mutate())

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toMatchObject({ code: 'USER_409' })
    expect(getLogoutCount()).toBe(0)
    expect(assign).not.toHaveBeenCalled()
  })
})
