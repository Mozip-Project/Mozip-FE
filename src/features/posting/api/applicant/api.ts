import { ReportPostingDocument, type ReportPostingMutationVariables } from '@/gql/graphql'
import { requestGraphQL } from '@/lib/graphqlClient'

async function reportPosting(variables: ReportPostingMutationVariables) {
  const data = await requestGraphQL(ReportPostingDocument, variables)
  return data.reportPosting
}

export { reportPosting }
