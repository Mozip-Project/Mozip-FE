import { MANAGED_POSTING_DETAIL_SAMPLE } from '@/features/posting/mocks/managedPostingDetailSample'
import { MANAGED_POSTING_SAMPLE } from '@/features/posting/mocks/managedPostingSample'
import {
  POSTING_UP_RANK,
  type ManagedPosting,
  type ManagedPostingDetail,
} from '@/features/posting/types'

// 실제 API 전 화면 동작 확인용 샘플 상태
let managedPostingState: ManagedPosting[] = MANAGED_POSTING_SAMPLE
let upRemainingCount = 1

// TODO: 단체 기준 공고 관리 목록 API 확정 후 실제 요청으로 교체
// eslint-disable-next-line @typescript-eslint/require-await -- API 교체 시 호출부 변경 방지
async function getManagedPostings(): Promise<ManagedPosting[]> {
  return managedPostingState
}

// TODO: organizationPostings(status: 진행 중) 연결 시 서버 정렬의 첫 항목 사용
async function getFirstPublishedPostingId(): Promise<string | null> {
  const postings = await getManagedPostings()
  return postings.find((posting) => posting.status === 'published')?.id ?? null
}

// TODO: 공고 삭제 API 확정 후 실제 요청으로 교체
// eslint-disable-next-line @typescript-eslint/require-await -- API 교체 시 호출부 변경 방지
async function deleteManagedPosting(postingId: string) {
  managedPostingState = managedPostingState.filter((posting) => posting.id !== postingId)
}

// TODO: 공고 관리 상세 API 확정 후 교체, 다른 단체의 공고가 열리지 않도록 단체 권한 확인
// eslint-disable-next-line @typescript-eslint/require-await -- API 교체 시 호출부 변경 방지
async function getManagedPostingDetail(postingId: string): Promise<ManagedPostingDetail | null> {
  return MANAGED_POSTING_DETAIL_SAMPLE.find((posting) => posting.id === postingId) ?? null
}

// TODO: 이용권 API 확정 후 단체의 남은 UP 횟수 조회로 교체
// eslint-disable-next-line @typescript-eslint/require-await -- API 교체 시 호출부 변경 방지
async function getUpRemainingCount() {
  return upRemainingCount
}

// TODO: 공고 UP API 확정 후 실제 요청으로 교체
// eslint-disable-next-line @typescript-eslint/require-await -- API 교체 시 호출부 변경 방지
async function upManagedPosting(postingId: string): Promise<{ latestRank: number }> {
  if (upRemainingCount === 0) {
    throw new Error('남은 UP 횟수 없음')
  }

  upRemainingCount -= 1
  managedPostingState = managedPostingState.map((posting) =>
    posting.id === postingId && posting.status === 'published'
      ? { ...posting, latestRank: POSTING_UP_RANK }
      : posting,
  )

  return { latestRank: POSTING_UP_RANK }
}

export {
  deleteManagedPosting,
  getFirstPublishedPostingId,
  getManagedPostingDetail,
  getManagedPostings,
  getUpRemainingCount,
  upManagedPosting,
}
