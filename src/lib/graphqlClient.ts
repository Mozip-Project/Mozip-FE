import { GraphQLClient, type TypedDocumentString, type Variables } from 'graphql-request'
import { ApiError, parseRestError, toApiError } from './apiError'

const TOKEN_EXPIRED_CODE = 'AUTH_002'
const REISSUE_ALREADY_DONE_CODE = 'AUTH_007'
const REISSUE_PATH = '/auth/reissue'

type VariablesArgs<TVariables> = TVariables extends Record<string, never> ? [] : [TVariables]

let graphqlClient: GraphQLClient | undefined
let pendingReissue: Promise<void> | undefined

function getGraphQLEndpoint() {
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT
  if (!endpoint) {
    throw new Error('NEXT_PUBLIC_GRAPHQL_ENDPOINT 환경 변수가 없습니다.')
  }
  return endpoint
}

// 동시에 여러 요청이 만료돼도 재발급은 한 번만 요청
function reissueToken() {
  pendingReissue ??= (async () => {
    const response = await fetch(new URL(REISSUE_PATH, getGraphQLEndpoint()), {
      method: 'POST',
      credentials: 'include',
    })
    if (response.ok) {
      return
    }

    const body: unknown = await response.json().catch(() => undefined)
    const error = parseRestError(body)
    if (error?.code === REISSUE_ALREADY_DONE_CODE) {
      return
    }

    // TODO: AUTH_004, AUTH_005면 로그인 화면으로 이동
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

async function requestGraphQL<TResult, TVariables extends Variables>(
  document: TypedDocumentString<TResult, TVariables>,
  ...[variables]: VariablesArgs<TVariables>
): Promise<TResult> {
  const client = (graphqlClient ??= new GraphQLClient(getGraphQLEndpoint(), {
    credentials: 'include',
  }))

  try {
    return await client.request<TResult>(document, variables)
  } catch (error) {
    const apiError = toApiError(error)
    if (!shouldReissue(apiError)) {
      throw apiError
    }
  }

  await reissueToken()

  try {
    return await client.request<TResult>(document, variables)
  } catch (error) {
    throw toApiError(error)
  }
}

export { requestGraphQL }
