import { http, HttpResponse } from 'msw'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/lib/apiError'
import { server } from '@/mocks/server'
import { logout } from './api'

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('logout', () => {
  it('MSW 기본 응답으로 성공', async () => {
    await expect(logout()).resolves.toBeUndefined()
  })

  it('AUTH_006이면 쿠키가 남아 있으므로 ApiError로 실패', async () => {
    server.use(
      http.post('*/auth/logout', () =>
        HttpResponse.json(
          {
            success: false,
            code: 'AUTH_006',
            message: '로그인 처리를 잠시 할 수 없습니다. 잠시 후 다시 시도해 주세요.',
            data: null,
            traceId: 'trace-1',
          },
          { status: 503 },
        ),
      ),
    )

    await expect(logout()).rejects.toBeInstanceOf(ApiError)
    await expect(logout()).rejects.toMatchObject({ code: 'AUTH_006' })
  })
})
