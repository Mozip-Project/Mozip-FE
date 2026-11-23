import { delay, HttpResponse } from 'msw'
import type {
  BumpPostingMutation,
  BumpPostingMutationVariables,
  DeletePostingMutation,
  DeletePostingMutationVariables,
  ManagedPostingFieldsFragment,
  ManagedPostingSummaryQuery,
  ManagedPostingSummaryQueryVariables,
  OrganizationPostingsQuery,
  OrganizationPostingsQueryVariables,
} from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { MOCK_RESPONSE_DELAY_MS } from '@/mocks/responseDelay'

// 명세상 UP하면 최신순 맨 위
const BUMPED_RANK = 1

type OrganizationPostingState = {
  upCredits: number
  postings: ManagedPostingFieldsFragment[]
}

// 단체 ID는 내 정보(me) MSW의 소속 단체와 같음, 공고 ID는 공고 관리 상세 샘플과 같음
// 단체 1은 Figma 홈(진행 중 2·작성 중 1·종료 1), 단체 2는 공고 없는 상태
function createInitialState(): Record<string, OrganizationPostingState> {
  return {
    '1': {
      upCredits: 1,
      postings: [
        {
          id: '2',
          title: 'UXUX 14기 운영진 모집',
          status: 'RECRUITING',
          hasInterview: false,
          publishedAt: '2026-10-01T10:00:00+09:00',
          recruitEndAt: '2026-10-15T23:59:00+09:00',
          docResultConfirmedAt: null,
          docResultAt: '2026-10-18T10:00:00+09:00',
          finalResultAt: '2026-10-27T10:00:00+09:00',
          bumpRank: 18,
        },
        {
          id: '1',
          title: 'UXUX 14기 신입 부원 모집',
          status: 'DOC_REVIEW',
          hasInterview: true,
          publishedAt: '2026-09-27T10:00:00+09:00',
          recruitEndAt: '2026-09-30T23:59:00+09:00',
          docResultConfirmedAt: null,
          docResultAt: '2026-10-18T10:00:00+09:00',
          finalResultAt: '2026-10-27T10:00:00+09:00',
          bumpRank: 24,
        },
        // 모집 일정 입력 전에 임시 저장한 공고
        {
          id: '3',
          title: 'UXUX 15기 운영진 추가 모집',
          status: 'DRAFT',
          hasInterview: false,
          publishedAt: null,
          recruitEndAt: null,
          docResultConfirmedAt: null,
          docResultAt: null,
          finalResultAt: null,
          bumpRank: null,
        },
        {
          id: '4',
          title: 'UXUX 13기 신입 부원 모집',
          status: 'ENDED',
          hasInterview: false,
          publishedAt: '2026-10-01T10:00:00+09:00',
          recruitEndAt: '2026-10-15T23:59:00+09:00',
          docResultConfirmedAt: '2026-10-27T10:00:00+09:00',
          docResultAt: '2026-10-18T10:00:00+09:00',
          finalResultAt: '2026-10-27T10:00:00+09:00',
          bumpRank: null,
        },
      ],
    },
    '2': { upCredits: 0, postings: [] },
  }
}

// 삭제·UP 결과가 새로고침 전까지 유지되도록 메모리에 보관
let organizationStates = createInitialState()

function resetManagedPostings() {
  organizationStates = createInitialState()
}

function findPosting(postingId: string) {
  for (const state of Object.values(organizationStates)) {
    const posting = state.postings.find(({ id }) => id === postingId)
    if (posting) {
      return { state, posting }
    }
  }
  return null
}

function errorBody(code: string, message: string) {
  return { errors: [{ message, extensions: { code } }], data: null }
}

const NOT_MEMBER_ERROR = ['COMMON_403', '접근 권한이 없습니다.'] as const
const POSTING_NOT_FOUND_ERROR = ['POSTING_404', '공고를 찾을 수 없습니다.'] as const

const managedPostingHandlers = [
  graphqlApi.query<OrganizationPostingsQuery, OrganizationPostingsQueryVariables>(
    'OrganizationPostings',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      // ID 입력은 string | number로 생성되어 문자열로 통일
      const state = organizationStates[String(variables.organizationId)]

      if (!state) {
        return HttpResponse.json(errorBody(...NOT_MEMBER_ERROR))
      }

      const { status } = variables
      const statuses = status ? (Array.isArray(status) ? status : [status]) : null
      const organizationPostings = statuses
        ? state.postings.filter((posting) => statuses.includes(posting.status))
        : state.postings
      return HttpResponse.json({ data: { organizationPostings } })
    },
  ),

  graphqlApi.query<ManagedPostingSummaryQuery, ManagedPostingSummaryQueryVariables>(
    'ManagedPostingSummary',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const organizationId = String(variables.organizationId)
      const state = organizationStates[organizationId]

      if (!state) {
        return HttpResponse.json(errorBody(...NOT_MEMBER_ERROR))
      }

      const countOf = (predicate: (posting: ManagedPostingFieldsFragment) => boolean) =>
        state.postings.filter(predicate).length

      return HttpResponse.json({
        data: {
          organization: {
            id: organizationId,
            upCredits: state.upCredits,
            postingCounts: {
              published: countOf(({ status }) => status !== 'DRAFT' && status !== 'ENDED'),
              draft: countOf(({ status }) => status === 'DRAFT'),
              ended: countOf(({ status }) => status === 'ENDED'),
            },
          },
        },
      })
    },
  ),

  graphqlApi.mutation<BumpPostingMutation, BumpPostingMutationVariables>(
    'BumpPosting',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const found = findPosting(String(variables.id))

      if (!found) {
        return HttpResponse.json(errorBody(...POSTING_NOT_FOUND_ERROR))
      }
      if (found.posting.status !== 'RECRUITING') {
        return HttpResponse.json(
          errorBody('POSTING_409', '지원 접수 중인 공고만 UP할 수 있습니다.'),
        )
      }
      if (found.state.upCredits === 0) {
        return HttpResponse.json(errorBody('PAYMENT_402', 'UP하기 잔여권이 없습니다.'))
      }

      found.state.upCredits -= 1
      found.posting.bumpRank = BUMPED_RANK
      return HttpResponse.json({
        data: { bumpPosting: { id: found.posting.id, bumpRank: BUMPED_RANK } },
      })
    },
  ),

  graphqlApi.mutation<DeletePostingMutation, DeletePostingMutationVariables>(
    'DeletePosting',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const found = findPosting(String(variables.id))

      if (!found) {
        return HttpResponse.json(errorBody(...POSTING_NOT_FOUND_ERROR))
      }
      if (found.posting.status !== 'DRAFT') {
        return HttpResponse.json(errorBody('POSTING_409', '작성 중인 공고만 삭제할 수 있습니다.'))
      }

      found.state.postings = found.state.postings.filter(({ id }) => id !== found.posting.id)
      return HttpResponse.json({ data: { deletePosting: true } })
    },
  ),
]

export { managedPostingHandlers, resetManagedPostings }
