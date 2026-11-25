import { ORGANIZATION_POSTING_SAMPLES } from '@/features/posting/mocks/organizationPostingSamples'
import {
  BumpPostingDocument,
  DeletePostingDocument,
  ManagedPostingDetailDocument,
  ManagedPostingSummaryDocument,
  OrganizationPostingsDocument,
  PostingDraftDocument,
  PublishPostingDocument,
  SavePostingDraftDocument,
  SendNoticeDocument,
  type PostingStatus,
  type SavePostingDraftMutationVariables,
  type SendNoticeMutationVariables,
} from '@/gql/graphql'
import { requestGraphQL } from '@/lib/graphqlClient'

// TODO: LNB 모집 선택 작업 때 organizationPostings(진행 중)의 첫 항목으로 교체, 지금은 운영진 홈 MSW와 같은 단체 공고 샘플 사용
// eslint-disable-next-line @typescript-eslint/require-await -- API 교체 시 호출부 변경 방지
async function getFirstPublishedPostingId(): Promise<string | null> {
  return (
    ORGANIZATION_POSTING_SAMPLES.find(({ status }) => status !== 'DRAFT' && status !== 'ENDED')
      ?.id ?? null
  )
}

async function getOrganizationPostings(organizationId: string, status: readonly PostingStatus[]) {
  const data = await requestGraphQL(OrganizationPostingsDocument, {
    organizationId,
    status: [...status],
  })
  return data.organizationPostings
}

async function getManagedPostingSummary(organizationId: string) {
  const data = await requestGraphQL(ManagedPostingSummaryDocument, { organizationId })
  return data.organization
}

async function bumpPosting(postingId: string) {
  const data = await requestGraphQL(BumpPostingDocument, { id: postingId })
  return data.bumpPosting
}

async function deletePosting(postingId: string) {
  const data = await requestGraphQL(DeletePostingDocument, { id: postingId })
  return data.deletePosting
}

async function getManagedPosting(postingId: string) {
  const data = await requestGraphQL(ManagedPostingDetailDocument, { id: postingId })
  return data.posting
}

async function sendNotice(variables: SendNoticeMutationVariables) {
  const data = await requestGraphQL(SendNoticeDocument, variables)
  return data.sendNotice
}

async function getPostingDraft(postingId: string) {
  const data = await requestGraphQL(PostingDraftDocument, { id: postingId })
  return data.posting
}

// id 없이 저장하면 새 공고 생성
async function savePostingDraft(variables: SavePostingDraftMutationVariables) {
  const data = await requestGraphQL(SavePostingDraftDocument, variables)
  return data.savePostingDraft
}

async function publishPosting(postingId: string) {
  const data = await requestGraphQL(PublishPostingDocument, { id: postingId })
  return data.publishPosting
}

export {
  bumpPosting,
  deletePosting,
  getManagedPosting,
  getManagedPostingSummary,
  getFirstPublishedPostingId,
  getOrganizationPostings,
  getPostingDraft,
  publishPosting,
  savePostingDraft,
  sendNotice,
}
