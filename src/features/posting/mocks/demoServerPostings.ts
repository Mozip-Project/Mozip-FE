import type {
  DemoServerOrganizationPostingsQuery,
  ManagedPostingFieldsFragment,
} from '@/gql/graphql'

// 전시회 시연 모드에서 실서버 공고를 MSW 샘플과 합침 (전시회 후 삭제)

type ServerManagedPosting = DemoServerOrganizationPostingsQuery['organizationPostings'][number]

function byPublishedAtDesc(a: ServerManagedPosting, b: ServerManagedPosting) {
  return (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '')
}

// 서버에 순위가 없어 명세처럼 최근에 게시한 지원 접수 중 공고부터 1위로 채움
function toServerManagedPostings(
  serverPostings: readonly ServerManagedPosting[],
): ManagedPostingFieldsFragment[] {
  const rankById = new Map(
    serverPostings
      .filter(({ status }) => status === 'RECRUITING')
      .toSorted(byPublishedAtDesc)
      .map(({ id }, index) => [id, index + 1]),
  )

  return serverPostings.map((posting) => ({
    ...posting,
    bumpRank: rankById.get(posting.id) ?? null,
  }))
}

// 시연에서 게시한 공고가 먼저 보이도록 실서버 공고를 앞에 둠
function mergeServerPostings(
  samples: readonly ManagedPostingFieldsFragment[],
  serverPostings: readonly ServerManagedPosting[],
): ManagedPostingFieldsFragment[] {
  return [...toServerManagedPostings(serverPostings), ...samples]
}

export { mergeServerPostings }
export type { ServerManagedPosting }
