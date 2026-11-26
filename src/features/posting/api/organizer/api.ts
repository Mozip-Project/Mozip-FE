import {
  BumpPostingDocument,
  DeletePostingDocument,
  ManagedPostingDetailDocument,
  ManagedPostingSummaryDocument,
  OrganizationPostingsDocument,
  SendNoticeDocument,
  type PostingStatus,
  type SendNoticeMutationVariables,
} from '@/gql/graphql'
import { requestGraphQL } from '@/lib/graphqlClient'

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

export {
  bumpPosting,
  deletePosting,
  getManagedPosting,
  getManagedPostingSummary,
  getOrganizationPostings,
  sendNotice,
}
