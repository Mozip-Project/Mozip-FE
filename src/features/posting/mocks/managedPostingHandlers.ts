import { delay, HttpResponse } from 'msw'
import { isPostingDemoMode, isServerPosting } from '@/features/posting/utils/demoServerPosting'
import {
  DemoServerDeletePostingDocument,
  DemoServerOrganizationPostingsDocument,
  type BumpPostingMutation,
  type BumpPostingMutationVariables,
  type DeletePostingMutation,
  type DeletePostingMutationVariables,
  type ManagedPostingDetailQuery,
  type ManagedPostingDetailQueryVariables,
  type ManagedPostingFieldsFragment,
  type ManagedPostingSummaryQuery,
  type ManagedPostingSummaryQueryVariables,
  type OrganizationPostingsQuery,
  type OrganizationPostingsQueryVariables,
  type SendNoticeMutation,
  type SendNoticeMutationVariables,
} from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { MOCK_ORGANIZATION_ID } from '@/mocks/mockOrganization'
import { MOCK_RESPONSE_DELAY_MS } from '@/mocks/responseDelay'
import { requestServerGraphQL } from '@/mocks/serverGraphql'
import { addDaysToIsoDate, getSeoulIsoDate } from '@/utils/date'
import {
  fetchServerPostingDetail,
  mergeServerPostings,
  toServerErrorBody,
} from './demoServerPostings'
import {
  findOrganizationPostingSample,
  isDocumentResultConfirmed,
  ORGANIZATION_POSTING_SAMPLES,
  type OrganizationPostingSample,
} from './organizationPostingSamples'
import { createPostingSample } from './postingDetailHandlers'
import type { GraphQLResponseBody } from 'msw/graphql'

// 명세상 UP하면 최신순 맨 위
const BUMPED_RANK = 1
// 명세의 공지 제목·본문 길이 제한
const NOTICE_SUBJECT_MAX_LENGTH = 100
const NOTICE_BODY_MAX_LENGTH = 1000
// 운영진 홈 공고가 아닌 상세 샘플은 다른 단체 공고로 응답
const OTHER_ORGANIZATION_ID = 'other-organization'

const RECRUITMENT_PERIOD_DAYS = 14

function toSeoulDateTime(isoDate: string, time: string) {
  return `${isoDate}T${time}+09:00`
}

// 홈 카드와 관리 상세가 같은 일정을 쓰도록 단체 공고 샘플의 마감일로 생성
function getPublishedSchedule(postingId: string, today: string) {
  const endInDays = findOrganizationPostingSample(postingId)?.endInDays
  if (endInDays === undefined || endInDays === null) {
    return null
  }

  const endDate = addDaysToIsoDate(today, endInDays)
  const startAt = toSeoulDateTime(addDaysToIsoDate(endDate, -RECRUITMENT_PERIOD_DAYS), '00:00:00')
  return {
    publishedAt: startAt,
    recruitStartAt: startAt,
    recruitEndAt: toSeoulDateTime(endDate, '23:59:59'),
    docResultAt: toSeoulDateTime(addDaysToIsoDate(endDate, 3), '18:00:00'),
    interviewDates: [6, 7, 8].map((days) => addDaysToIsoDate(endDate, days)),
    finalResultAt: toSeoulDateTime(addDaysToIsoDate(endDate, 12), '18:00:00'),
  }
}

// 작성 중 공고는 일정 입력 전, 서류 결과는 발표일에 확정한 것으로 처리
function toManagedPostingFields(
  { id, title, status, hasInterview, bumpRank }: OrganizationPostingSample,
  today: string,
): ManagedPostingFieldsFragment {
  const schedule = getPublishedSchedule(id, today)
  const docResultAt = schedule?.docResultAt ?? null

  return {
    id,
    title,
    status,
    hasInterview,
    bumpRank,
    publishedAt: schedule?.publishedAt ?? null,
    recruitEndAt: schedule?.recruitEndAt ?? null,
    docResultAt,
    finalResultAt: schedule?.finalResultAt ?? null,
    docResultConfirmedAt: isDocumentResultConfirmed(status) ? docResultAt : null,
  }
}

type OrganizationPostingState = {
  upCredits: number
  postings: ManagedPostingFieldsFragment[]
}

// 단체 ID는 내 정보(me) MSW의 소속 단체와 같음, 단체 1 공고는 organizationPostingSamples, 단체 2는 공고 없는 상태
function createInitialState(): Record<string, OrganizationPostingState> {
  const today = getSeoulIsoDate(new Date())

  return {
    [MOCK_ORGANIZATION_ID]: {
      upCredits: 1,
      postings: ORGANIZATION_POSTING_SAMPLES.map((sample) => toManagedPostingFields(sample, today)),
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
  for (const [organizationId, state] of Object.entries(organizationStates)) {
    const posting = state.postings.find(({ id }) => id === postingId)
    if (posting) {
      return { organizationId, state, posting }
    }
  }
  return null
}

// 공지 받는 사람 수, 지원자 관리 MSW와 같은 인원
function getApplicantCount(postingId: string) {
  return findOrganizationPostingSample(postingId)?.applicantCount ?? 0
}

// 지원자 관리 MSW가 운영진 홈과 같은 공고 상태를 쓰도록 공개
function getManagedPostingSample(postingId: string) {
  return findPosting(postingId)?.posting ?? null
}

function isManagingOrganization(organizationId: string) {
  return organizationId in organizationStates
}

// 공고 작성 MSW의 저장·게시 결과를 운영진 홈 목록에 반영, 새 공고는 맨 앞
function saveManagedPosting(organizationId: string, posting: ManagedPostingFieldsFragment) {
  const state = organizationStates[organizationId]
  if (!state) {
    return
  }
  const index = state.postings.findIndex(({ id }) => id === posting.id)
  state.postings = index === -1 ? [posting, ...state.postings] : state.postings.with(index, posting)
}

// 시연 모드는 실서버 단체 1 공고를 샘플과 함께 보여 줌, 서버 조회가 실패해도 샘플은 표시 (전시회 후 삭제)
async function getDisplayedPostings(organizationId: string, state: OrganizationPostingState) {
  if (!isPostingDemoMode() || organizationId !== MOCK_ORGANIZATION_ID) {
    return state.postings
  }
  try {
    const { organizationPostings } = await requestServerGraphQL(
      DemoServerOrganizationPostingsDocument,
      { organizationId },
    )
    return mergeServerPostings(state.postings, organizationPostings)
  } catch {
    return state.postings
  }
}

// 시연 모드의 실서버 공고 상세, 서버에 없는 지원서 수·같은 단체 공고는 0·빈 목록 (전시회 후 삭제)
async function getServerManagedPostingDetail(postingId: string) {
  type Body = GraphQLResponseBody<ManagedPostingDetailQuery>
  try {
    const posting = await fetchServerPostingDetail(postingId)
    return HttpResponse.json<Body>({ data: { posting: { ...posting, applicationCount: 0 } } })
  } catch (error) {
    return HttpResponse.json<Body>(toServerErrorBody(error))
  }
}

function getNoticeFieldErrors({ subject, body }: SendNoticeMutationVariables) {
  const fieldErrors = []
  const trimmedSubject = subject.trim()
  const trimmedBody = body.trim()

  if (!trimmedSubject || subject.length > NOTICE_SUBJECT_MAX_LENGTH) {
    fieldErrors.push({ field: 'subject', message: '제목은 1~100자로 입력해 주세요' })
  }
  if (!trimmedBody || body.length > NOTICE_BODY_MAX_LENGTH) {
    fieldErrors.push({ field: 'body', message: '본문은 1~1,000자로 입력해 주세요' })
  }
  return fieldErrors
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
      const postings = await getDisplayedPostings(String(variables.organizationId), state)
      const organizationPostings = statuses
        ? postings.filter((posting) => statuses.includes(posting.status))
        : postings
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

      const postings = await getDisplayedPostings(organizationId, state)
      const countOf = (predicate: (posting: ManagedPostingFieldsFragment) => boolean) =>
        postings.filter(predicate).length

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
      const postingId = String(variables.id)
      // 시연 모드의 실서버 공고는 실서버에서 삭제 (전시회 후 삭제)
      if (isServerPosting(postingId)) {
        try {
          const { deletePosting } = await requestServerGraphQL(DemoServerDeletePostingDocument, {
            id: postingId,
          })
          return HttpResponse.json({ data: { deletePosting } })
        } catch {
          return HttpResponse.json(errorBody('POSTING_409', '공고를 삭제하지 못했습니다.'))
        }
      }
      const found = findPosting(postingId)

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

  // 공고 내용은 지원자 공고 상세 MSW와 같은 데이터, 일정만 홈 카드와 맞춤
  graphqlApi.query<ManagedPostingDetailQuery, ManagedPostingDetailQueryVariables>(
    'ManagedPostingDetail',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const postingId = String(variables.id)
      if (isServerPosting(postingId)) {
        return getServerManagedPostingDetail(postingId)
      }
      const today = getSeoulIsoDate(new Date())
      const posting = createPostingSample(postingId, today)

      if (!posting) {
        return HttpResponse.json(errorBody(...POSTING_NOT_FOUND_ERROR))
      }

      const organizationId = findPosting(postingId)?.organizationId ?? OTHER_ORGANIZATION_ID
      const schedule = getPublishedSchedule(postingId, today)
      const homeSchedule = schedule
        ? {
            recruitStartAt: schedule.recruitStartAt,
            recruitEndAt: schedule.recruitEndAt,
            docResultAt: schedule.docResultAt,
            finalResultAt: schedule.finalResultAt,
            interviewTimeRanges: posting.hasInterview
              ? schedule.interviewDates.map((date) => ({ date }))
              : [],
          }
        : {}
      return HttpResponse.json({
        data: {
          posting: {
            ...posting,
            ...homeSchedule,
            applicationCount: getApplicantCount(postingId),
            organization: { ...posting.organization, id: organizationId },
          },
        },
      })
    },
  ),

  graphqlApi.mutation<SendNoticeMutation, SendNoticeMutationVariables>(
    'SendNotice',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const postingId = String(variables.postingId)
      const found = findPosting(postingId)

      if (!found) {
        return HttpResponse.json(errorBody(...POSTING_NOT_FOUND_ERROR))
      }
      if (found.posting.status === 'DRAFT') {
        return HttpResponse.json(
          errorBody('MESSAGE_409', '게시 전 공고에는 공지를 보낼 수 없습니다.'),
        )
      }

      const fieldErrors = getNoticeFieldErrors(variables)
      if (fieldErrors.length > 0) {
        return HttpResponse.json({
          errors: [
            { message: '입력값을 확인해 주세요.', extensions: { code: 'COMMON_400', fieldErrors } },
          ],
          data: null,
        })
      }
      if (getApplicantCount(postingId) === 0) {
        return HttpResponse.json(errorBody('MESSAGE_422', '공지를 받을 지원자가 없습니다.'))
      }

      return HttpResponse.json({ data: { sendNotice: { id: `notice-${postingId}` } } })
    },
  ),
]

export {
  getManagedPostingSample,
  isManagingOrganization,
  managedPostingHandlers,
  resetManagedPostings,
  saveManagedPosting,
}
