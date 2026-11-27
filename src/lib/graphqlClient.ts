import { GraphQLClient, type TypedDocumentString, type Variables } from 'graphql-request'
import { getGraphQLEndpoint, getMockRoleHeaders } from './apiEndpoint'
import { ApiError, toApiError } from './apiError'
import { withTokenReissue } from './tokenReissue'

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

function isNonRetryableError(error: unknown) {
  if (!(error instanceof ApiError)) {
    return false
  }
  return NON_RETRYABLE_AUTH_CODES.has(error.code) || CLIENT_ERROR_CODE_PATTERN.test(error.code)
}

// 환경 변수 누락도 reject로 전달하도록 async
async function requestGraphQL<TResult, TVariables extends Variables>(
  document: TypedDocumentString<TResult, TVariables>,
  ...[variables]: VariablesArgs<TVariables>
): Promise<TResult> {
  const client = (graphqlClient ??= new GraphQLClient(getGraphQLEndpoint(), {
    credentials: 'include',
    headers: getMockRoleHeaders(),
  }))

  return withTokenReissue(() => client.request<TResult>(document, variables), toApiError)
}

export { getGraphQLEndpoint, isNonRetryableError, requestGraphQL }
