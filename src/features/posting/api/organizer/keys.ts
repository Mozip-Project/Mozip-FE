import type { PostingStatus } from '@/gql/graphql'

// 삭제·UP은 단체 ID 없이 목록 전체·요약 전체를 갱신하도록 종류를 단체보다 앞에 둠
const managedPostingKeys = {
  all: ['managedPostings'] as const,
  lists: ['managedPostings', 'list'] as const,
  list: (organizationId: string, status: readonly PostingStatus[]) =>
    ['managedPostings', 'list', organizationId, status] as const,
  // 탭 숫자와 UP 잔여 횟수
  summary: (organizationId: string) => ['managedPostings', 'summary', organizationId] as const,
}

export { managedPostingKeys }
