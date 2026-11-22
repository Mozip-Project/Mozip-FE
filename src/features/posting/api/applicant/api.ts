import {
  PostingsDocument,
  ReportPostingDocument,
  type ReportPostingMutationVariables,
} from '@/gql/graphql'
import { requestGraphQL } from '@/lib/graphqlClient'

// page는 서버 기준 0부터
async function getPostings(page: number, size: number) {
  const data = await requestGraphQL(PostingsDocument, { page, size })
  return data.postings
}

async function reportPosting(variables: ReportPostingMutationVariables) {
  const data = await requestGraphQL(ReportPostingDocument, variables)
  return data.reportPosting
}

export { getPostings, reportPosting }
