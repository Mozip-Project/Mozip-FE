import { MeDocument } from '@/gql/graphql'
import { requestGraphQL } from '@/lib/graphqlClient'

async function getMe() {
  const data = await requestGraphQL(MeDocument)
  return data.me
}

export { getMe }
