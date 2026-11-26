import { http, HttpResponse } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { server } from '@/mocks/server'
import { ApiError } from './apiError'
import { postRest, requestRest } from './restClient'

// MSW가 가로채는 테스트 전용 주소, REST는 GraphQL 주소와 같은 origin 사용
const GRAPHQL_ENDPOINT = 'https://api.test/graphql'
const SAMPLE_URL = 'https://api.test/api/sample'
const REISSUE_URL = 'https://api.test/auth/reissue'
const LOGOUT_URL = 'https://api.test/auth/logout'

function restSuccess(data: unknown) {
  return HttpResponse.json({ success: true, code: 'OK', message: '요청이 성공했습니다.', data })
}

function restError(status: number, code: string, data: unknown = null) {
  return HttpResponse.json(
    { success: false, code, message: `${code} 메시지`, data, traceId: 'trace-1' },
    { status },
  )
}

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', GRAPHQL_ENDPOINT)
})

afterEach(() => {
  vi.restoreAllMocks()
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('requestRest', () => {
  it('공통 응답의 data만 반환', async () => {
    server.use(http.get(SAMPLE_URL, () => restSuccess({ id: 1 })))

    await expect(requestRest('/api/sample')).resolves.toEqual({ id: 1 })
  })

  it('본문은 JSON으로 보내고 쿠키를 포함', async () => {
    let received: { body: unknown; contentType: string | null } | undefined
    server.use(
      http.post(SAMPLE_URL, async ({ request }) => {
        received = { body: await request.json(), contentType: request.headers.get('Content-Type') }
        return restSuccess(null)
      }),
    )
    // Node fetch는 credentials를 무시해 서버 쪽이 아닌 호출 옵션으로 확인
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    await requestRest('/api/sample', { method: 'POST', body: { name: '모집' } })

    expect(received).toEqual({ body: { name: '모집' }, contentType: 'application/json' })
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({ credentials: 'include' }),
    )
    fetchSpy.mockRestore()
  })

  it('개발 서버 인증 우회 값이 있으면 X-Mock-Role 헤더 포함', async () => {
    vi.stubEnv('NEXT_PUBLIC_MOCK_ROLE', 'OPERATOR')
    let mockRole: string | null = null
    server.use(
      http.get(SAMPLE_URL, ({ request }) => {
        mockRole = request.headers.get('X-Mock-Role')
        return restSuccess(null)
      }),
    )

    await requestRest('/api/sample')

    expect(mockRole).toBe('OPERATOR')
    vi.stubEnv('NEXT_PUBLIC_MOCK_ROLE', '')
  })

  it('실패 응답은 code·traceId·입력별 메시지를 담은 ApiError', async () => {
    server.use(
      http.post(SAMPLE_URL, () =>
        restError(400, 'COMMON_400', [{ field: 'size', message: '용량을 확인해 주세요.' }]),
      ),
    )

    const error: unknown = await requestRest('/api/sample', { method: 'POST', body: {} }).catch(
      (caught: unknown) => caught,
    )

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      code: 'COMMON_400',
      traceId: 'trace-1',
      fieldErrors: [{ field: 'size', message: '용량을 확인해 주세요.' }],
    })
  })

  it('공통 형식이 아닌 실패는 HTTP 상태를 담은 에러', async () => {
    server.use(http.get(SAMPLE_URL, () => new HttpResponse('Bad Gateway', { status: 502 })))

    await expect(requestRest('/api/sample')).rejects.toThrow('REST 요청 실패 (HTTP 502)')
  })

  it('토큰이 만료되면 재발급한 뒤 같은 요청을 다시 보냄', async () => {
    let isTokenFresh = false
    let reissueCount = 0
    server.use(
      http.get(SAMPLE_URL, () =>
        isTokenFresh ? restSuccess({ id: 1 }) : restError(401, 'AUTH_002'),
      ),
      http.post(REISSUE_URL, () => {
        reissueCount += 1
        isTokenFresh = true
        return restSuccess(null)
      }),
    )

    await expect(requestRest('/api/sample')).resolves.toEqual({ id: 1 })
    expect(reissueCount).toBe(1)
  })
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
