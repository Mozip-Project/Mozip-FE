import type { PostingStatus } from '@/gql/graphql'

const managedPostingKeys = {
  all: ['managedPostings'] as const,
  organization: (organizationId: string) => ['managedPostings', organizationId] as const,
  lists: (organizationId: string) => ['managedPostings', organizationId, 'list'] as const,
  list: (organizationId: string, status: readonly PostingStatus[]) =>
    ['managedPostings', organizationId, 'list', status] as const,
  // 탭 숫자와 UP 잔여 횟수
  summary: (organizationId: string) => ['managedPostings', organizationId, 'summary'] as const,
}

export { managedPostingKeys }
