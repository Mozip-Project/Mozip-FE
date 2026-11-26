import { getApiUrl, getMockRoleHeaders } from './apiEndpoint'
import { parseRestError } from './apiError'
import { withTokenReissue } from './tokenReissue'

type RestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type RestRequestOptions = {
  method?: RestMethod
  // JSON으로 보낼 본문, 없으면 본문 없이 요청
  body?: unknown
}

function readData(payload: unknown): unknown {
  if (typeof payload !== 'object' || payload === null) {
    return undefined
  }
  return Reflect.get(payload, 'data')
}

async function sendRest(path: string, { method = 'GET', body }: RestRequestOptions) {
  const hasBody = body !== undefined
  const response = await fetch(getApiUrl(path), {
    method,
    credentials: 'include',
    headers: {
      ...getMockRoleHeaders(),
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    },
    body: hasBody ? JSON.stringify(body) : undefined,
  })
  const payload: unknown = await response.json().catch(() => undefined)

  // 백엔드 공통 응답 { success, code, message, data }, 실패는 HTTP 상태와 success로 판단
  if (!response.ok || Reflect.get(Object(payload), 'success') === false) {
    throw parseRestError(payload) ?? new Error(`REST 요청 실패 (HTTP ${response.status})`)
  }
  return readData(payload)
}

// 응답의 data만 반환, 모양은 API마다 달라 호출부에서 좁힘
function requestRest(path: string, options: RestRequestOptions = {}): Promise<unknown> {
  return withTokenReissue(
    () => sendRest(path, options),
    (error) => error,
  )
}

// 로그인 없이 호출하는 /auth/* 용도라 토큰 재발급(AUTH_002) 미처리
// 주소는 GraphQL 엔드포인트 origin 기준, 성공 응답의 data만 반환
async function postRest(path: `/${string}`): Promise<unknown> {
  const response = await fetch(getApiUrl(path), {
    method: 'POST',
    credentials: 'include',
  })
  const body: unknown = await response.json().catch(() => undefined)

  if (response.ok) {
    return readData(body)
  }
  throw parseRestError(body) ?? new Error(`REST 요청 실패 (HTTP ${response.status})`)
}

export { postRest, requestRest }
export type { RestRequestOptions }
