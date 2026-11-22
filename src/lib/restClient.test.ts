import { http, HttpResponse } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { server } from '@/mocks/server'
import { ApiError } from './apiError'
import { postRest } from './restClient'

const LOGOUT_URL = 'https://api.test/auth/logout'

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
})

afterEach(() => {
  vi.restoreAllMocks()
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('postRest', () => {
  // Node의 MSW는 요청을 다시 만들며 credentials를 잃어 fetch에 넘긴 옵션으로 확인
  it('엔드포인트 origin으로 쿠키를 포함해 POST하고 성공 응답의 data 반환', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    server.use(
      http.post(LOGOUT_URL, () =>
        HttpResponse.json({
          success: true,
          code: 'OK',
          message: '요청이 성공했습니다.',
          data: { id: 1 },
        }),
      ),
    )

    await expect(postRest('/auth/logout')).resolves.toEqual({ id: 1 })
    expect(fetchSpy).toHaveBeenCalledWith(new URL(LOGOUT_URL), {
      method: 'POST',
      credentials: 'include',
    })
  })

  it('본문이 없는 성공은 data 없이 끝남', async () => {
    server.use(http.post(LOGOUT_URL, () => new HttpResponse(null, { status: 200 })))

    await expect(postRest('/auth/logout')).resolves.toBeUndefined()
  })

  it('실패 응답은 code·message·traceId를 담은 ApiError로 던짐', async () => {
    server.use(
      http.post(LOGOUT_URL, () =>
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

    const error: unknown = await postRest('/auth/logout').catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      code: 'AUTH_006',
      message: '로그인 처리를 잠시 할 수 없습니다. 잠시 후 다시 시도해 주세요.',
      traceId: 'trace-1',
    })
  })

  it('공통 형식이 아닌 실패 응답은 HTTP 상태를 담은 에러로 던짐', async () => {
    server.use(http.post(LOGOUT_URL, () => new HttpResponse('Bad Gateway', { status: 502 })))

    await expect(postRest('/auth/logout')).rejects.toThrow('REST 요청 실패 (HTTP 502)')
  })
})
