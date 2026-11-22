import { parseRestError } from './apiError'
import { getGraphQLEndpoint } from './graphqlClient'

// 로그인 없이 호출하는 /auth/* 용도라 토큰 재발급(AUTH_002) 미처리, 보호된 REST가 생기면 추가
// 주소는 GraphQL 엔드포인트 origin 기준, 성공 응답의 data만 반환
async function postRest(path: `/${string}`): Promise<unknown> {
  const response = await fetch(new URL(path, getGraphQLEndpoint()), {
    method: 'POST',
    credentials: 'include',
  })
  const body: unknown = await response.json().catch(() => undefined)

  if (response.ok) {
    return typeof body === 'object' && body !== null ? Reflect.get(body, 'data') : undefined
  }
  throw parseRestError(body) ?? new Error(`REST 요청 실패 (HTTP ${response.status})`)
}

export { postRest }
