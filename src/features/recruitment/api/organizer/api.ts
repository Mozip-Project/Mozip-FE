import {
  ConfirmDocResultDocument,
  DocEvaluationApplicationChipsDocument,
  DocEvaluationApplicationDetailDocument,
  DocEvaluationApplicationsDocument,
  DocEvaluationSummaryDocument,
  MyDocEvaluationDocument,
  PostingApplicationsDocument,
  PostingQuestionsDocument,
  RecruitmentPostingDocument,
  ResultMessageRecipientsDocument,
  SaveDocEvaluationDocument,
  SetDocResultDocument,
  type DocEvaluationApplicationsQueryVariables,
  type DocEvaluationSummaryQueryVariables,
  type PostingApplicationsQueryVariables,
  type SaveDocEvaluationMutationVariables,
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

async function getDocEvaluationApplicationChips(postingId: string) {
  const data = await requestGraphQL(DocEvaluationApplicationChipsDocument, { postingId })
  return data.docEvaluationApplicationChips
}

async function getDocEvaluationApplicationDetail(applicationId: string) {
  const data = await requestGraphQL(DocEvaluationApplicationDetailDocument, { id: applicationId })
  return data.application
}

async function getPostingQuestions(postingId: string) {
  const data = await requestGraphQL(PostingQuestionsDocument, { id: postingId })
  return data.posting.questions
}

async function getMyDocEvaluation(applicationId: string) {
  const data = await requestGraphQL(MyDocEvaluationDocument, { applicationId })
  return data.myDocEvaluation
}

async function saveDocEvaluation(variables: SaveDocEvaluationMutationVariables) {
  const data = await requestGraphQL(SaveDocEvaluationDocument, variables)
  return data.saveDocEvaluation
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

async function getResultMessageRecipients(postingId: string) {
  const data = await requestGraphQL(ResultMessageRecipientsDocument, {
    postingId,
    type: 'DOC_RESULT',
  })
  return data.resultMessages
}

export {
  confirmDocResult,
  getDocEvaluationApplicationChips,
  getDocEvaluationApplicationDetail,
  getDocEvaluationApplications,
  getDocEvaluationSummary,
  getMyDocEvaluation,
  getPostingApplications,
  getPostingQuestions,
  getRecruitmentPosting,
  getResultMessageRecipients,
  saveDocEvaluation,
  setDocResult,
}
