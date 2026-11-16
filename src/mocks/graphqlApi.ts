import { graphql } from 'msw/graphql'

// 엔드포인트 환경 변수 값과 관계없이 모든 /graphql 요청 처리
const graphqlApi = graphql.link('*/graphql')

export { graphqlApi }
