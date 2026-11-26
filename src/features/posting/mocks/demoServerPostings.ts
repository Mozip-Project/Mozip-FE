import { ClientError } from 'graphql-request'
import {
  DemoServerPostingDetailDocument,
  PostingsDocument,
  type DemoServerOrganizationPostingsQuery,
  type ManagedPostingFieldsFragment,
  type PostingsQuery,
  type PostingsQueryVariables,
} from '@/gql/graphql'
import { requestServerGraphQL } from '@/mocks/serverGraphql'

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

// 서버에 없는 같은 단체 진행 중 공고는 빈 목록
async function fetchServerPostingDetail(postingId: string) {
  const { posting } = await requestServerGraphQL(DemoServerPostingDetailDocument, {
    id: postingId,
  })
  return { ...posting, otherActivePostings: [] }
}

// 없는 공고(POSTING_404) 등 서버 오류 코드를 그대로 전달, 네트워크 실패는 COMMON_500
function toServerErrorBody(error: unknown) {
  const errors =
    error instanceof ClientError && error.response.errors
      ? error.response.errors.map(({ message, extensions }) => ({ message, extensions }))
      : [{ message: '공고를 불러오지 못했습니다.', extensions: { code: 'COMMON_500' } }]
  return { errors, data: null }
}

const EMPTY_POSTING_PAGE = { totalCount: 0, items: [] } satisfies PostingsQuery['postings']

// 같은 필터·정렬로 첫 페이지만 조회, 실패해도 샘플은 보이도록 빈 결과
async function fetchServerPostingPage(
  variables: PostingsQueryVariables,
): Promise<PostingsQuery['postings']> {
  try {
    const { postings } = await requestServerGraphQL(PostingsDocument, { ...variables, page: 0 })
    return postings
  } catch {
    return EMPTY_POSTING_PAGE
  }
}

export {
  EMPTY_POSTING_PAGE,
  fetchServerPostingDetail,
  fetchServerPostingPage,
  mergeServerPostings,
  toServerErrorBody,
}
export type { ServerManagedPosting }
