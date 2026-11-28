import { ClientError } from 'graphql-request'
import {
  DemoServerApplicationFormDocument,
  DemoServerPostingDetailDocument,
  PostingsDocument,
  type DemoServerOrganizationPostingsQuery,
  type ManagedPostingFieldsFragment,
  type PostingApplicationFormQuery,
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

// 평가·면접 시연에 쓰는 샘플이 새로 게시한 공고에 밀리지 않도록 샘플을 앞에 둠
function mergeServerPostings(
  samples: readonly ManagedPostingFieldsFragment[],
  serverPostings: readonly ServerManagedPosting[],
): ManagedPostingFieldsFragment[] {
  return [...samples, ...toServerManagedPostings(serverPostings)]
}

// 서버에 없는 같은 단체 진행 중 공고는 빈 목록
async function fetchServerPostingDetail(postingId: string) {
  const { posting } = await requestServerGraphQL(DemoServerPostingDetailDocument, {
    id: postingId,
  })
  return { ...posting, otherActivePostings: [] }
}

// 서버에 없는 파일 문항 설정은 파일·링크 모두 받는 것으로, 프로필 사진은 받지 않는 것으로 채움
async function fetchServerApplicationForm(
  postingId: string,
): Promise<PostingApplicationFormQuery['posting']> {
  const { posting } = await requestServerGraphQL(DemoServerApplicationFormDocument, {
    id: postingId,
  })
  return {
    ...posting,
    profilePhotoRequired: false,
    questions: posting.questions.map((question) => ({
      ...question,
      options:
        question.type === 'FILE_LINK'
          ? {
              activityFields: null,
              maxEntries: null,
              acceptFile: true,
              acceptLink: true,
              fileTypes: ['PDF', 'IMAGE', 'PPT', 'MP4'],
            }
          : null,
    })),
  }
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

type PostingPage = PostingsQuery['postings']

// 같은 필터·정렬·페이지로 조회, 실패해도 샘플은 보이도록 빈 결과
async function fetchServerPostingPage(variables: PostingsQueryVariables): Promise<PostingPage> {
  try {
    const { postings } = await requestServerGraphQL(PostingsDocument, variables)
    return postings
  } catch {
    return EMPTY_POSTING_PAGE
  }
}

// 지원서 작성이 되는 샘플을 맨 앞에 두므로, 그 뒤에 이어지는 실서버 공고 중 이 페이지에 들어갈 구간
function getServerPostingRange(sampleCount: number, page: number, size: number) {
  return {
    start: Math.max(page * size - sampleCount, 0),
    end: Math.max((page + 1) * size - sampleCount, 0),
  }
}

// 샘플 수만큼 밀려 서버 페이지 두 개에 걸칠 수 있음, 전체 개수가 필요해 한 페이지는 항상 조회
function getServerPagesToFetch(sampleCount: number, page: number, size: number): number[] {
  const { start, end } = getServerPostingRange(sampleCount, page, size)
  const firstPage = Math.floor(start / size)
  const lastPage = Math.floor(Math.max(end - 1, start) / size)

  return Array.from({ length: lastPage - firstPage + 1 }, (_, index) => firstPage + index)
}

// serverPages는 getServerPagesToFetch 순서대로 조회한 결과
function mergeServerPostingPage(
  samples: readonly PostingPage['items'][number][],
  serverPages: readonly PostingPage[],
  page: number,
  size: number,
): PostingPage {
  const { start, end } = getServerPostingRange(samples.length, page, size)
  const fetchedStart = Math.floor(start / size) * size
  const serverItems = serverPages.flatMap(({ items }) => items)

  return {
    totalCount: samples.length + (serverPages[0]?.totalCount ?? 0),
    items: [
      ...samples.slice(page * size, (page + 1) * size),
      ...serverItems.slice(start - fetchedStart, end - fetchedStart),
    ],
  }
}

export {
  fetchServerApplicationForm,
  fetchServerPostingDetail,
  fetchServerPostingPage,
  getServerPagesToFetch,
  mergeServerPostingPage,
  mergeServerPostings,
  toServerErrorBody,
}
export type { ServerManagedPosting }
