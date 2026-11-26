function getGraphQLEndpoint() {
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT
  if (!endpoint) {
    throw new Error('NEXT_PUBLIC_GRAPHQL_ENDPOINT 환경 변수가 없습니다.')
  }
  return endpoint
}

// 개발 서버 인증 우회용 회원 선택 헤더, 쿠키가 있으면 서버가 쿠키 우선
const MOCK_ROLE_HEADER = 'X-Mock-Role'

// GraphQL·REST 공용, 값이 없으면 헤더 없음
function getMockRoleHeaders(): Record<string, string> {
  const mockRole = process.env.NEXT_PUBLIC_MOCK_ROLE
  return mockRole ? { [MOCK_ROLE_HEADER]: mockRole } : {}
}

// REST는 GraphQL 엔드포인트와 같은 origin 사용
function getApiUrl(path: string) {
  return new URL(path, getGraphQLEndpoint())
}

export { getApiUrl, getGraphQLEndpoint, getMockRoleHeaders }
