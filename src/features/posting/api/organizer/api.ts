import { MANAGED_POSTING_DETAIL_SAMPLE } from '@/features/posting/mocks/managedPostingDetailSample'
import { MANAGED_POSTING_SAMPLE } from '@/features/posting/mocks/managedPostingSample'
import type { ManagedPostingDetail } from '@/features/posting/types'
import {
  BumpPostingDocument,
  DeletePostingDocument,
  ManagedPostingSummaryDocument,
  OrganizationPostingsDocument,
  type PostingStatus,
} from '@/gql/graphql'
import { requestGraphQL } from '@/lib/graphqlClient'

// TODO: 공고 관리 상세 연결 시 organizationPostings(진행 중)의 첫 항목으로 교체, 지금은 상세 샘플과 맞춘 목록 샘플 사용
// eslint-disable-next-line @typescript-eslint/require-await -- API 교체 시 호출부 변경 방지
async function getFirstPublishedPostingId(): Promise<string | null> {
  return MANAGED_POSTING_SAMPLE.find((posting) => posting.status === 'published')?.id ?? null
}

// TODO: 공고 관리 상세 API 확정 후 교체, 다른 단체의 공고가 열리지 않도록 단체 권한 확인
// eslint-disable-next-line @typescript-eslint/require-await -- API 교체 시 호출부 변경 방지
async function getManagedPostingDetail(postingId: string): Promise<ManagedPostingDetail | null> {
  return MANAGED_POSTING_DETAIL_SAMPLE.find((posting) => posting.id === postingId) ?? null
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

export {
  bumpPosting,
  deletePosting,
  getManagedPostingSummary,
  getFirstPublishedPostingId,
  getManagedPostingDetail,
  getOrganizationPostings,
}
