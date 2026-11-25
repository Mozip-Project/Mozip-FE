import {
  ApplicantManagementPostingDocument,
  DocEvaluationApplicationsDocument,
  DocumentReviewPostingDocument,
  PostingApplicationsDocument,
  type DocEvaluationApplicationsQueryVariables,
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

async function getDocumentReviewPosting(postingId: string) {
  const data = await requestGraphQL(DocumentReviewPostingDocument, { id: postingId })
  return data.posting
}

async function getDocEvaluationApplications(variables: DocEvaluationApplicationsQueryVariables) {
  const data = await requestGraphQL(DocEvaluationApplicationsDocument, variables)
  return data.docEvaluationApplications
}

export {
  getApplicantManagementPosting,
  getDocEvaluationApplications,
  getDocumentReviewPosting,
  getPostingApplications,
}
