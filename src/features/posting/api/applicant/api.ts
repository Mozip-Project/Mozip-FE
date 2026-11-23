import {
  PostingDocument,
  PostingsDocument,
  ReportPostingDocument,
  type PostingsQueryVariables,
  type ReportPostingMutationVariables,
} from '@/gql/graphql'
import { requestGraphQL } from '@/lib/graphqlClient'

async function getPostings(variables: PostingsQueryVariables) {
  const data = await requestGraphQL(PostingsDocument, variables)
  return data.postings
}

async function getPostingDetail(id: string) {
  const data = await requestGraphQL(PostingDocument, { id })
  return data.posting
}

async function reportPosting(variables: ReportPostingMutationVariables) {
  const data = await requestGraphQL(ReportPostingDocument, variables)
  return data.reportPosting
}

export { getPostingDetail, getPostings, reportPosting }
