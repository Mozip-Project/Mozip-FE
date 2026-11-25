import type { PostingStatus } from '@/gql/graphql'

// 삭제·UP은 단체 ID 없이 목록 전체·요약 전체를 갱신하도록 종류를 단체보다 앞에 둠
const managedPostingKeys = {
  all: ['managedPostings'] as const,
  lists: ['managedPostings', 'list'] as const,
  list: (organizationId: string, status: readonly PostingStatus[]) =>
    ['managedPostings', 'list', organizationId, status] as const,
  // 탭 숫자와 UP 잔여 횟수
  summary: (organizationId: string) => ['managedPostings', 'summary', organizationId] as const,
  // 공고 관리 상세, 공지 받는 사람 수 포함
  detail: (postingId: string) => ['managedPostings', 'detail', postingId] as const,
}

// 공고 목록·상세를 다시 불러올 때 작성 중인 화면 값까지 다시 받지 않도록 분리
const postingDraftKeys = {
  detail: (postingId: string) => ['postingDraft', postingId] as const,
}

export { managedPostingKeys, postingDraftKeys }
