import { GraphQLClient, type TypedDocumentString, type Variables } from 'graphql-request'
import { ApiError, parseRestError, toApiError } from './apiError'

const TOKEN_EXPIRED_CODE = 'AUTH_002'
const REISSUE_ALREADY_DONE_CODE = 'AUTH_007'
const SESSION_EXPIRED_CODES = ['AUTH_004', 'AUTH_005']
const REISSUE_PATH = '/auth/reissue'
// TODO: 로그인 페이지가 생기면 로그인 경로로 변경
const SESSION_EXPIRED_REDIRECT_PATH = '/'
// 로그인 실패·만료·손상·세션 종료, AUTH_006은 명세상 잠시 후 재시도라 제외
const NON_RETRYABLE_AUTH_CODES = new Set([
  'AUTH_001',
  'AUTH_002',
  'AUTH_003',
  'AUTH_004',
  'AUTH_005',
])
// 백엔드 코드 형식이 도메인_HTTP상태라 4xx는 다시 보내도 같은 결과
const CLIENT_ERROR_CODE_PATTERN = /_4\d{2}$/

type VariablesArgs<TVariables> = TVariables extends Record<string, never> ? [] : [TVariables]

let graphqlClient: GraphQLClient | undefined
let pendingReissue: Promise<void> | undefined
// 재발급 성공마다 증가, 요청 뒤 이미 재발급됐는지 판단에 사용
let reissueGeneration = 0

function getGraphQLEndpoint() {
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT
  if (!endpoint) {
    throw new Error('NEXT_PUBLIC_GRAPHQL_ENDPOINT 환경 변수가 없습니다.')
  }
  return endpoint
}

function redirectOnSessionExpired() {
  // 이동할 화면에서 다시 만료되면 새로고침 반복 방지
  if (window.location.pathname === SESSION_EXPIRED_REDIRECT_PATH) {
    return
  }
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- React 밖 호출, 이전 계정 캐시 초기화
  window.location.assign(SESSION_EXPIRED_REDIRECT_PATH)
}

// 동시에 여러 요청이 만료돼도 재발급은 한 번만 요청
function reissueToken() {
  pendingReissue ??= (async () => {
    const response = await fetch(new URL(REISSUE_PATH, getGraphQLEndpoint()), {
      method: 'POST',
      credentials: 'include',
    })
    if (response.ok) {
      reissueGeneration += 1
      return
    }

    const body: unknown = await response.json().catch(() => undefined)
    const error = parseRestError(body)
    if (error?.code === REISSUE_ALREADY_DONE_CODE) {
      reissueGeneration += 1
      return
    }

    if (error && SESSION_EXPIRED_CODES.includes(error.code)) {
      redirectOnSessionExpired()
    }
    throw error ?? new Error(`토큰 재발급 실패 (HTTP ${response.status})`)
  })().finally(() => {
    pendingReissue = undefined
  })
  return pendingReissue
}

function shouldReissue(error: unknown) {
  // 서버 prefetch는 쿠키 없이 공개 조회만 하므로 브라우저에서만 재발급
  const isBrowser = typeof window !== 'undefined'
  return isBrowser && error instanceof ApiError && error.code === TOKEN_EXPIRED_CODE
}

function isNonRetryableError(error: unknown) {
  if (!(error instanceof ApiError)) {
    return false
  }
  return NON_RETRYABLE_AUTH_CODES.has(error.code) || CLIENT_ERROR_CODE_PATTERN.test(error.code)
}

async function requestGraphQL<TResult, TVariables extends Variables>(
  document: TypedDocumentString<TResult, TVariables>,
  ...[variables]: VariablesArgs<TVariables>
): Promise<TResult> {
  const client = (graphqlClient ??= new GraphQLClient(getGraphQLEndpoint(), {
    credentials: 'include',
  }))

  const generationAtRequest = reissueGeneration

  try {
    return await client.request<TResult>(document, variables)
  } catch (error) {
    const apiError = toApiError(error)
    if (!shouldReissue(apiError)) {
      throw apiError
    }
  }

  // 재발급이 끝난 뒤 늦게 도착한 만료 응답은 재발급 없이 다시 요청
  if (reissueGeneration === generationAtRequest) {
    await reissueToken()
  }

  try {
    return await client.request<TResult>(document, variables)
  } catch (error) {
    throw toApiError(error)
  }
}

export { getGraphQLEndpoint, isNonRetryableError, requestGraphQL }
