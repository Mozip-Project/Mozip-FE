import { http, HttpResponse } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { TypedDocumentString } from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { server } from '@/mocks/server'
import { ApiError } from './apiError'
import { isNonRetryableError, requestGraphQL } from './graphqlClient'
import type { GraphQLResponseBody } from 'msw/graphql'

// MSW가 가로채는 테스트 전용 주소, 재발급 주소는 GraphQL 주소와 같은 origin 필요
const GRAPHQL_ENDPOINT = 'https://api.test/graphql'
const REISSUE_URL = 'https://api.test/auth/reissue'

type HealthResult = { health: { status: string } }

const HealthDocument = new TypedDocumentString<HealthResult, Record<string, never>>(
  'query Health { health { status } }',
)

const HEALTH_DATA: HealthResult = { health: { status: 'UP' } }

function graphqlError(code: string) {
  // msw v3는 본문 타입을 resolver 반환 위치에서만 추론해 helper에서는 직접 지정
  return HttpResponse.json<GraphQLResponseBody<HealthResult>>({
    errors: [{ message: `${code} 메시지`, extensions: { code, traceId: 'trace-1' } }],
    data: null,
  })
}

function restError(status: number, code: string) {
  return HttpResponse.json(
    { success: false, code, message: `${code} 메시지`, data: null, traceId: 'trace-2' },
    { status },
  )
}

// 첫 요청은 토큰 만료, 재발급 뒤 요청부터 성공
function expireOnceThenSucceed() {
  let isTokenFresh = false
  let reissueCount = 0

  server.use(
    graphqlApi.query('Health', () =>
      isTokenFresh ? HttpResponse.json({ data: HEALTH_DATA }) : graphqlError('AUTH_002'),
    ),
    http.post(REISSUE_URL, () => {
      reissueCount += 1
      isTokenFresh = true
      return HttpResponse.json({
        success: true,
        code: 'OK',
        message: '요청이 성공했습니다.',
        data: null,
      })
    }),
  )

  return { getReissueCount: () => reissueCount }
}

// jsdom은 페이지 이동 미지원이라 현재 경로와 assign만 대체
function stubLocation(pathname: string) {
  const assign = vi.fn()
  vi.stubGlobal('location', { ...window.location, pathname, assign })
  return assign
}

// 재발급까지 실패하는 상황
function failReissueWith(code: string) {
  server.use(
    graphqlApi.query('Health', () => graphqlError('AUTH_002')),
    http.post(REISSUE_URL, () => restError(401, code)),
  )
}

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', GRAPHQL_ENDPOINT)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('requestGraphQL', () => {
  it('응답의 data를 반환한다', async () => {
    server.use(graphqlApi.query('Health', () => HttpResponse.json({ data: HEALTH_DATA })))

    await expect(requestGraphQL(HealthDocument)).resolves.toEqual(HEALTH_DATA)
  })

  it('GraphQL errors를 extensions.code와 traceId를 담은 ApiError로 바꾼다', async () => {
    server.use(graphqlApi.query('Health', () => graphqlError('COMMON_500')))

    await expect(requestGraphQL(HealthDocument)).rejects.toMatchObject({
      name: 'ApiError',
      code: 'COMMON_500',
      message: 'COMMON_500 메시지',
      traceId: 'trace-1',
    })
  })

  it('GraphQL 실행 전 REST 형식 에러도 ApiError로 바꾼다', async () => {
    server.use(http.post(GRAPHQL_ENDPOINT, () => restError(403, 'COMMON_403')))

    await expect(requestGraphQL(HealthDocument)).rejects.toMatchObject({
      code: 'COMMON_403',
      traceId: 'trace-2',
    })
  })

  it('토큰이 만료되면 재발급한 뒤 같은 요청을 다시 보낸다', async () => {
    const { getReissueCount } = expireOnceThenSucceed()

    await expect(requestGraphQL(HealthDocument)).resolves.toEqual(HEALTH_DATA)
    expect(getReissueCount()).toBe(1)
  })

  it('동시에 여러 요청이 만료돼도 재발급은 한 번만 보낸다', async () => {
    const { getReissueCount } = expireOnceThenSucceed()

    const results = await Promise.all([
      requestGraphQL(HealthDocument),
      requestGraphQL(HealthDocument),
      requestGraphQL(HealthDocument),
    ])

    expect(results).toEqual([HEALTH_DATA, HEALTH_DATA, HEALTH_DATA])
    expect(getReissueCount()).toBe(1)
  })

  it('재발급이 끝난 뒤 늦게 도착한 만료 응답은 재발급 없이 다시 보낸다', async () => {
    let requestCount = 0
    let reissueCount = 0
    let releaseStaleResponse: () => void = () => {}
    const staleResponseReleased = new Promise<void>((resolve) => {
      releaseStaleResponse = resolve
    })

    server.use(
      graphqlApi.query('Health', async () => {
        requestCount += 1
        // 첫 응답은 바로 만료, 두 번째 응답은 재발급 뒤 다시 요청이 올 때까지 붙잡아 둠
        if (requestCount === 1) {
          return graphqlError('AUTH_002')
        }
        if (requestCount === 2) {
          await staleResponseReleased
          return graphqlError('AUTH_002')
        }
        // 세 번째는 재발급을 마친 요청의 재요청
        if (requestCount === 3) {
          releaseStaleResponse()
        }
        return HttpResponse.json({ data: HEALTH_DATA })
      }),
      http.post(REISSUE_URL, () => {
        reissueCount += 1
        return HttpResponse.json({
          success: true,
          code: 'OK',
          message: '요청이 성공했습니다.',
          data: null,
        })
      }),
    )

    const results = await Promise.all([
      requestGraphQL(HealthDocument),
      requestGraphQL(HealthDocument),
    ])

    expect(results).toEqual([HEALTH_DATA, HEALTH_DATA])
    expect(reissueCount).toBe(1)
  })

  it('재발급이 AUTH_007이면 원래 요청만 다시 보낸다', async () => {
    let requestCount = 0
    server.use(
      graphqlApi.query('Health', () => {
        requestCount += 1
        return requestCount === 1
          ? graphqlError('AUTH_002')
          : HttpResponse.json({ data: HEALTH_DATA })
      }),
      http.post(REISSUE_URL, () => restError(409, 'AUTH_007')),
    )

    await expect(requestGraphQL(HealthDocument)).resolves.toEqual(HEALTH_DATA)
  })

  it('재발급이 AUTH_004면 다시 요청하지 않고 에러를 던진다', async () => {
    let requestCount = 0
    server.use(
      graphqlApi.query('Health', () => {
        requestCount += 1
        return graphqlError('AUTH_002')
      }),
      http.post(REISSUE_URL, () => restError(401, 'AUTH_004')),
    )

    const error: unknown = await requestGraphQL(HealthDocument).catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ code: 'AUTH_004' })
    expect(requestCount).toBe(1)
  })

  it.each(['AUTH_004', 'AUTH_005'])('재발급이 %s면 / 로 이동한다', async (code) => {
    const assign = stubLocation('/manage')
    failReissueWith(code)

    await expect(requestGraphQL(HealthDocument)).rejects.toMatchObject({ code })
    expect(assign).toHaveBeenCalledWith('/')
  })

  it('이미 / 에 있으면 재발급이 실패해도 다시 이동하지 않는다', async () => {
    const assign = stubLocation('/')
    failReissueWith('AUTH_004')

    await expect(requestGraphQL(HealthDocument)).rejects.toMatchObject({ code: 'AUTH_004' })
    expect(assign).not.toHaveBeenCalled()
  })

  it('재발급 뒤에도 만료되면 반복하지 않고 에러를 던진다', async () => {
    let reissueCount = 0
    server.use(
      graphqlApi.query('Health', () => graphqlError('AUTH_002')),
      http.post(REISSUE_URL, () => {
        reissueCount += 1
        return HttpResponse.json({
          success: true,
          code: 'OK',
          message: '요청이 성공했습니다.',
          data: null,
        })
      }),
    )

    await expect(requestGraphQL(HealthDocument)).rejects.toMatchObject({ code: 'AUTH_002' })
    expect(reissueCount).toBe(1)
  })
})

describe('isNonRetryableError', () => {
  it('재발급까지 거친 인증 실패는 다시 시도하지 않는다', () => {
    for (const code of ['AUTH_002', 'AUTH_004', 'AUTH_005']) {
      expect(isNonRetryableError(new ApiError({ code, message: code }))).toBe(true)
    }
  })

  it('그 밖의 에러는 다시 시도한다', () => {
    expect(isNonRetryableError(new ApiError({ code: 'COMMON_500', message: '' }))).toBe(false)
    expect(isNonRetryableError(new TypeError('Failed to fetch'))).toBe(false)
  })
})
