import { GraphQLClient, type TypedDocumentString, type Variables } from 'graphql-request'
import { bypass } from 'msw'
import { getGraphQLEndpoint } from '@/lib/graphqlClient'

// 전시회 시연 모드에서 MSW가 샘플과 합칠 실서버 공고를 직접 조회 (전시회 후 삭제)

let serverClient: GraphQLClient | undefined

// MSW가 다시 가로채지 않도록 bypass로 보내고, 앱 요청과 같은 개발 서버 인증 헤더 사용
function getServerClient() {
  const mockRole = process.env.NEXT_PUBLIC_MOCK_ROLE
  serverClient ??= new GraphQLClient(getGraphQLEndpoint(), {
    credentials: 'include',
    headers: mockRole ? { 'X-Mock-Role': mockRole } : {},
    fetch: (input, init) => fetch(bypass(input, init)),
  })
  return serverClient
}

function requestServerGraphQL<TResult, TVariables extends Variables>(
  document: TypedDocumentString<TResult, TVariables>,
  variables: TVariables,
): Promise<TResult> {
  return getServerClient().request<TResult>(document, variables)
}

export { requestServerGraphQL }
