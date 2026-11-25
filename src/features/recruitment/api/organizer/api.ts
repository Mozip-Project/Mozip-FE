import {
  ApplicantManagementPostingDocument,
  PostingApplicationsDocument,
  type PostingApplicationsQueryVariables,
} from '@/gql/graphql'
import { requestGraphQL } from '@/lib/graphqlClient'

async function getApplicantManagementPosting(postingId: string) {
  const data = await requestGraphQL(ApplicantManagementPostingDocument, { id: postingId })
  return data.posting
}

async function getPostingApplications(variables: PostingApplicationsQueryVariables) {
  const data = await requestGraphQL(PostingApplicationsDocument, variables)
  return data.postingApplications
}

export { getApplicantManagementPosting, getPostingApplications }
