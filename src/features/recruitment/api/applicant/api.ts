import {
  ApplicantProfileDocument,
  MyApplicationsDocument,
  PostingApplicationFormDocument,
  PostingMyApplicationsDocument,
  SaveApplicationDraftDocument,
  SubmitApplicationDocument,
  SubmittedApplicationDocument,
  type SaveApplicationDraftMutationVariables,
} from '@/gql/graphql'
import { requestGraphQL } from '@/lib/graphqlClient'

async function getPostingApplicationForm(postingId: string) {
  const data = await requestGraphQL(PostingApplicationFormDocument, { id: postingId })
  return data.posting
}

async function getPostingMyApplications(postingId: string) {
  const data = await requestGraphQL(PostingMyApplicationsDocument, { id: postingId })
  return data.posting.myApplications
}

async function getApplicantProfile() {
  const data = await requestGraphQL(ApplicantProfileDocument)
  return data.me
}

async function saveApplicationDraft(variables: SaveApplicationDraftMutationVariables) {
  const data = await requestGraphQL(SaveApplicationDraftDocument, variables)
  return data.saveApplicationDraft
}

// 제출은 저장된 지원서 id로만 가능해 지금 입력을 먼저 저장
async function submitApplication(variables: SaveApplicationDraftMutationVariables) {
  const { id } = await saveApplicationDraft(variables)
  const data = await requestGraphQL(SubmitApplicationDocument, { id })
  return data.submitApplication
}

async function getMyApplications() {
  const data = await requestGraphQL(MyApplicationsDocument)
  return data.myApplications
}

async function getSubmittedApplication(applicationId: string) {
  const data = await requestGraphQL(SubmittedApplicationDocument, { id: applicationId })
  return data.application
}

export {
  getApplicantProfile,
  getMyApplications,
  getPostingApplicationForm,
  getPostingMyApplications,
  getSubmittedApplication,
  saveApplicationDraft,
  submitApplication,
}
