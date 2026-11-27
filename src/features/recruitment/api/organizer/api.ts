import type { ResultNoticeTarget } from '@/features/recruitment/types'
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
  ResultMessageProgressDocument,
  ResultMessagesDocument,
  SaveMessageDocument,
  SendMessagesDocument,
  SaveDocEvaluationDocument,
  SetDocResultDocument,
  type DocEvaluationApplicationsQueryVariables,
  type MessageTarget,
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

const RESULT_MESSAGE_TARGET = {
  pass: 'PASS',
  fail: 'FAIL',
} satisfies Record<ResultNoticeTarget, MessageTarget>

// 최종 결과 안내가 생기면 type 인자 추가
async function getResultMessages(postingId: string) {
  const data = await requestGraphQL(ResultMessagesDocument, { postingId, type: 'DOC_RESULT' })
  return data.resultMessages
}

// 발송 중 진행률만
async function getResultMessageProgress(postingId: string) {
  const data = await requestGraphQL(ResultMessageProgressDocument, {
    postingId,
    type: 'DOC_RESULT',
  })
  return data.resultMessages
}

type SaveResultMessageVariables = {
  postingId: string
  target: ResultNoticeTarget
  subject: string
  body: string
}

async function saveResultMessage({ target, ...variables }: SaveResultMessageVariables) {
  const data = await requestGraphQL(SaveMessageDocument, {
    ...variables,
    type: 'DOC_RESULT',
    target: RESULT_MESSAGE_TARGET[target],
  })
  return data.saveMessage
}

// 응답은 발송 시작 직후 상태
async function sendResultMessages(postingId: string, targets: readonly ResultNoticeTarget[]) {
  const data = await requestGraphQL(SendMessagesDocument, {
    postingId,
    type: 'DOC_RESULT',
    targets: targets.map((target) => RESULT_MESSAGE_TARGET[target]),
  })
  return data.sendMessages
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
  getResultMessageProgress,
  getResultMessages,
  saveDocEvaluation,
  saveResultMessage,
  sendResultMessages,
  setDocResult,
}
