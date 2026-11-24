import { delay, HttpResponse } from 'msw'
import type {
  BumpPostingMutation,
  BumpPostingMutationVariables,
  DeletePostingMutation,
  DeletePostingMutationVariables,
  ManagedPostingDetailQuery,
  ManagedPostingDetailQueryVariables,
  ManagedPostingFieldsFragment,
  ManagedPostingSummaryQuery,
  ManagedPostingSummaryQueryVariables,
  OrganizationPostingsQuery,
  OrganizationPostingsQueryVariables,
  SendNoticeMutation,
  SendNoticeMutationVariables,
} from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { MOCK_RESPONSE_DELAY_MS } from '@/mocks/responseDelay'
import { addDaysToIsoDate, getSeoulIsoDate } from '@/utils/date'
import { createPostingSample, POSTING_SAMPLE_ID } from './postingDetailHandlers'

// 명세상 UP하면 최신순 맨 위
const BUMPED_RANK = 1
// 명세의 공지 제목·본문 길이 제한
const NOTICE_SUBJECT_MAX_LENGTH = 100
const NOTICE_BODY_MAX_LENGTH = 1000
// 운영진 홈 공고가 아닌 상세 샘플은 다른 단체 공고로 응답
const OTHER_ORGANIZATION_ID = 'other-organization'

// 제출 지원자 수, 여기 없는 공고(종료 공고 등)는 0명이라 공지 발송 시 MESSAGE_422
const APPLICATION_COUNT: Record<string, number> = {
  [POSTING_SAMPLE_ID.open]: 24,
  [POSTING_SAMPLE_ID.staff]: 12,
}

const RECRUITMENT_PERIOD_DAYS = 14
// 오늘 기준 모집 마감까지 남은 날, 운영진 모집은 지원 접수 중·신입 부원 모집은 마감 뒤 서류 평가 중
const RECRUITMENT_END_IN_DAYS: Record<string, number> = {
  [POSTING_SAMPLE_ID.staff]: 7,
  [POSTING_SAMPLE_ID.open]: -2,
}

function toSeoulDateTime(isoDate: string, time: string) {
  return `${isoDate}T${time}+09:00`
}

// 홈 카드와 관리 상세가 같은 일정을 쓰도록 진행 중 공고의 일정을 한곳에서 생성
function getPublishedSchedule(postingId: string, today: string) {
  const endInDays = RECRUITMENT_END_IN_DAYS[postingId]
  if (endInDays === undefined) {
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

function getListSchedule(postingId: string, today: string) {
  const schedule = getPublishedSchedule(postingId, today)
  if (!schedule) {
    throw new Error(`일정 없는 진행 중 공고: ${postingId}`)
  }
  const { publishedAt, recruitEndAt, docResultAt, finalResultAt } = schedule
  return { publishedAt, recruitEndAt, docResultAt, finalResultAt }
}

type OrganizationPostingState = {
  upCredits: number
  postings: ManagedPostingFieldsFragment[]
}

// 단체 ID는 내 정보(me) MSW의 소속 단체와 같음, 진행 중 공고 ID는 공고 상세 MSW와 같음
// 단체 1은 Figma 홈(진행 중 2·작성 중 1·종료 1), 단체 2는 공고 없는 상태
function createInitialState(): Record<string, OrganizationPostingState> {
  const today = getSeoulIsoDate(new Date())

  return {
    '1': {
      upCredits: 1,
      postings: [
        {
          id: POSTING_SAMPLE_ID.staff,
          title: 'UXUX 14기 운영진 모집',
          status: 'RECRUITING',
          hasInterview: false,
          ...getListSchedule(POSTING_SAMPLE_ID.staff, today),
          docResultConfirmedAt: null,
          bumpRank: 18,
        },
        {
          id: POSTING_SAMPLE_ID.open,
          title: 'UXUX 14기 신입 부원 모집',
          status: 'DOC_REVIEW',
          hasInterview: true,
          ...getListSchedule(POSTING_SAMPLE_ID.open, today),
          docResultConfirmedAt: null,
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
  for (const [organizationId, state] of Object.entries(organizationStates)) {
    const posting = state.postings.find(({ id }) => id === postingId)
    if (posting) {
      return { organizationId, state, posting }
    }
  }
  return null
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

  // 공고 내용은 지원자 공고 상세 MSW와 같은 데이터, 일정만 홈 카드와 맞춤
  graphqlApi.query<ManagedPostingDetailQuery, ManagedPostingDetailQueryVariables>(
    'ManagedPostingDetail',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const postingId = String(variables.id)
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
            applicationCount: APPLICATION_COUNT[postingId] ?? 0,
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
      if (!APPLICATION_COUNT[postingId]) {
        return HttpResponse.json(errorBody('MESSAGE_422', '공지를 받을 지원자가 없습니다.'))
      }

      return HttpResponse.json({ data: { sendNotice: { id: `notice-${postingId}` } } })
    },
  ),
]

export { managedPostingHandlers, resetManagedPostings }
