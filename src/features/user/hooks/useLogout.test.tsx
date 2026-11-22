import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { server } from '@/mocks/server'
import { useLogout } from './useLogout'
import type { ReactNode } from 'react'

function renderLogoutHook() {
  const queryClient = new QueryClient()

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  return renderHook(() => useLogout(), { wrapper: Wrapper })
}

// jsdom은 페이지 이동 미지원이라 assign만 대체
function stubLocationAssign() {
  const assign = vi.fn()
  vi.stubGlobal('location', { ...window.location, assign })
  return assign
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

describe('useLogout', () => {
  it('성공하면 로그아웃 홈으로 새로고침 이동', async () => {
    const assign = stubLocationAssign()
    const { result } = renderLogoutHook()

    act(() => result.current.mutate())

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(assign).toHaveBeenCalledWith('/')
  })

  it('AUTH_006이면 이동하지 않고 오류 전달', async () => {
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
    const { result } = renderLogoutHook()

    act(() => result.current.mutate())

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toMatchObject({ code: 'AUTH_006' })
    expect(assign).not.toHaveBeenCalled()
  })
})
