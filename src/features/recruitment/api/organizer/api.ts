import {
  ConfirmDocResultDocument,
  DocEvaluationApplicationsDocument,
  DocEvaluationSummaryDocument,
  PostingApplicationsDocument,
  RecruitmentPostingDocument,
  SetDocResultDocument,
  type DocEvaluationApplicationsQueryVariables,
  type DocEvaluationSummaryQueryVariables,
  type PostingApplicationsQueryVariables,
  type SetDocResultMutationVariables,
} from '@/gql/graphql'
import { requestGraphQL } from '@/lib/graphqlClient'

async function getRecruitmentPosting(postingId: string) {
  const data = await requestGraphQL(RecruitmentPostingDocument, { id: postingId })
  return data.posting
}

async function getPostingApplications(variables: PostingApplicationsQueryVariables) {
  const data = await requestGraphQL(PostingApplicationsDocument, variables)
  return data.postingApplications
}

async function getDocEvaluationApplications(variables: DocEvaluationApplicationsQueryVariables) {
  const data = await requestGraphQL(DocEvaluationApplicationsDocument, variables)
  return data.docEvaluationApplications
}

async function getDocEvaluationSummary(variables: DocEvaluationSummaryQueryVariables) {
  const data = await requestGraphQL(DocEvaluationSummaryDocument, variables)
  return data.docEvaluationSummary
}

async function setDocResult(variables: SetDocResultMutationVariables) {
  const data = await requestGraphQL(SetDocResultDocument, variables)
  return data.setDocResult
}

async function confirmDocResult(postingId: string) {
  const data = await requestGraphQL(ConfirmDocResultDocument, { postingId })
  return data.confirmDocResult
}

export {
  confirmDocResult,
  getDocEvaluationApplications,
  getDocEvaluationSummary,
  getPostingApplications,
  getRecruitmentPosting,
  setDocResult,
}
