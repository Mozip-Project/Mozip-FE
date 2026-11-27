import { delay, HttpResponse } from 'msw'
import type {
  PostingDraftFieldsFragment,
  PostingDraftInput,
  PostingDraftQuery,
  PostingDraftQueryVariables,
  PublishPostingMutation,
  PublishPostingMutationVariables,
  SavePostingDraftMutation,
  SavePostingDraftMutationVariables,
} from '@/gql/graphql'
import { getUploadedFileUrl } from '@/mocks/fileUploadHandlers'
import { graphqlApi } from '@/mocks/graphqlApi'
import { MOCK_ORGANIZATION_ID } from '@/mocks/mockOrganization'
import { MOCK_RESPONSE_DELAY_MS } from '@/mocks/responseDelay'
import { isManagingOrganization, saveManagedPosting } from './managedPostingHandlers'
import { ORGANIZATION_POSTING_SAMPLES } from './organizationPostingSamples'

type DraftRecord = {
  organizationId: string
  posting: PostingDraftFieldsFragment
}

type PublishFieldError = {
  field: 'basicStep' | 'positionsStep' | 'questionsStep'
  message: string
}

// 명세상 게시하면 최신순 맨 위
const PUBLISHED_BUMP_RANK = 1

// 저장 결과가 새로고침 전까지 유지되도록 메모리에 보관
let drafts = new Map<string, DraftRecord>()
let sequence = 0

function resetPostingDrafts() {
  drafts = new Map()
  sequence = 0
}

function nextId(prefix: string) {
  sequence += 1
  return `${prefix}-${sequence}`
}

function createEmptyPosting(
  id: string,
  organizationId: string,
  title: string,
  hasInterview: boolean,
): PostingDraftFieldsFragment {
  return {
    id,
    status: 'DRAFT',
    hasInterview,
    updatedAt: new Date().toISOString(),
    organization: { id: organizationId },
    title,
    images: [],
    region: null,
    fee: null,
    allowEnrolled: false,
    allowOnLeave: false,
    eligibilityNote: null,
    content: null,
    recruitStartAt: null,
    recruitEndAt: null,
    activityStartedOn: null,
    activityEndedOn: null,
    noPosition: false,
    positions: [],
    questions: [],
    interviewMinutes: null,
    breakMinutes: null,
    interviewTimeRanges: [],
    maxApplicantsPerInterview: null,
    maxParallelInterviews: null,
  }
}

// 운영진 홈의 작성 중 샘플은 처음 열 때 제목만 있는 공고로 생성
function findDraft(postingId: string) {
  const saved = drafts.get(postingId)
  if (saved) {
    return saved
  }

  const sample = ORGANIZATION_POSTING_SAMPLES.find(
    ({ id, status }) => id === postingId && status === 'DRAFT',
  )
  if (!sample) {
    return null
  }

  const record = {
    organizationId: MOCK_ORGANIZATION_ID,
    posting: createEmptyPosting(sample.id, MOCK_ORGANIZATION_ID, sample.title, sample.hasInterview),
  }
  drafts.set(sample.id, record)
  return record
}

// 지역·회비 등 지울 수 있는 값은 생략하면 유지, null이면 지움
function resolveClearable<TValue>(value: TValue | null | undefined, current: TValue | null) {
  return value === undefined ? current : value
}

// 포지션 없음으로 바꾸면 positions를 보내지 않아도 기존 포지션 삭제
function resolvePositions(
  posting: PostingDraftFieldsFragment,
  input: PostingDraftInput,
  noPosition: boolean,
) {
  if (input.positions) {
    return input.positions.map(({ name, sortOrder }) => ({
      id: nextId('position'),
      name,
      sortOrder,
    }))
  }
  return noPosition ? [] : posting.positions
}

// 면접 없음으로 바꾸면 interviewTimeRanges를 보내지 않아도 기존 시간대 삭제
function resolveTimeRanges(
  posting: PostingDraftFieldsFragment,
  input: PostingDraftInput,
  hasInterview: boolean,
) {
  if (!hasInterview) {
    return []
  }
  if (!input.interviewTimeRanges) {
    return posting.interviewTimeRanges
  }
  return input.interviewTimeRanges.map(({ date, startTime, endTime }) => ({
    id: nextId('time-range'),
    date: String(date),
    startTime: String(startTime),
    endTime: String(endTime),
  }))
}

// 서버처럼 지워진 포지션을 가리키던 문항은 공통 문항(position null)으로 남음 (ON DELETE SET NULL)
function detachRemovedPositions(
  questions: PostingDraftFieldsFragment['questions'],
  positionIds: Set<string>,
) {
  return questions.map((question) =>
    question.position && !positionIds.has(question.position.id)
      ? { ...question, position: null }
      : question,
  )
}

// 명세상 저장하면 포지션·문항·이미지·면접 시간대는 통째로 교체, 새 id 발급
function applyInput(
  posting: PostingDraftFieldsFragment,
  input: PostingDraftInput,
): PostingDraftFieldsFragment {
  const noPosition = input.noPosition ?? posting.noPosition
  const hasInterview = input.hasInterview ?? posting.hasInterview
  const positions = resolvePositions(posting, input, noPosition)
  const positionIds = new Set(positions.map(({ id }) => id))
  const findPosition = (positionId: string | number | null | undefined) =>
    positionId != null && positionIds.has(String(positionId)) ? { id: String(positionId) } : null

  return {
    ...posting,
    updatedAt: new Date().toISOString(),
    title: input.title ?? posting.title,
    content: input.content ?? posting.content,
    region: resolveClearable(input.region, posting.region),
    fee: resolveClearable(input.fee, posting.fee),
    allowEnrolled: input.allowEnrolled ?? posting.allowEnrolled,
    allowOnLeave: input.allowOnLeave ?? posting.allowOnLeave,
    eligibilityNote: resolveClearable(input.eligibilityNote, posting.eligibilityNote),
    activityStartedOn: resolveClearable(input.activityStartedOn, posting.activityStartedOn),
    activityEndedOn: resolveClearable(input.activityEndedOn, posting.activityEndedOn),
    recruitStartAt: input.recruitStartAt ?? posting.recruitStartAt,
    recruitEndAt: input.recruitEndAt ?? posting.recruitEndAt,
    images: input.images
      ? input.images.map(({ fileKey, sortOrder, isRepresentative }) => ({
          id: nextId('image'),
          url: getUploadedFileUrl(fileKey),
          sortOrder,
          isRepresentative: isRepresentative ?? false,
        }))
      : posting.images,
    noPosition,
    positions,
    questions: input.questions
      ? input.questions.map((question) => ({
          id: nextId('question'),
          position: findPosition(question.positionId),
          type: question.type,
          title: question.title,
          description: question.description ?? null,
          required: question.required,
          maxLength: question.maxLength ?? null,
          sortOrder: question.sortOrder,
        }))
      : detachRemovedPositions(posting.questions, positionIds),
    hasInterview,
    // 면접 없는 공고는 면접 설정을 비움
    interviewMinutes: hasInterview ? (input.interviewMinutes ?? posting.interviewMinutes) : null,
    breakMinutes: hasInterview ? (input.breakMinutes ?? posting.breakMinutes) : null,
    maxApplicantsPerInterview: hasInterview
      ? (input.maxApplicantsPerInterview ?? posting.maxApplicantsPerInterview)
      : null,
    maxParallelInterviews: hasInterview
      ? (input.maxParallelInterviews ?? posting.maxParallelInterviews)
      : null,
    interviewTimeRanges: resolveTimeRanges(posting, input, hasInterview),
  }
}

// 문항이 이번 저장 뒤의 포지션 id를 가리키는지 확인
function hasUnknownPosition(input: PostingDraftInput, posting: PostingDraftFieldsFragment) {
  const positionIds = new Set(posting.positions.map(({ id }) => id))
  return (input.questions ?? []).some(
    ({ positionId }) => positionId != null && !positionIds.has(String(positionId)),
  )
}

// 명세의 게시 필수 단계 검사
function getPublishFieldErrors(posting: PostingDraftFieldsFragment, now: Date) {
  const errors: PublishFieldError[] = []
  const { recruitStartAt, recruitEndAt, activityStartedOn, activityEndedOn } = posting

  if (!posting.title.trim() || posting.content === null) {
    errors.push({ field: 'basicStep', message: '기본 정보(제목, 본문)를 입력해주세요.' })
  }
  if (!recruitStartAt || !recruitEndAt) {
    errors.push({ field: 'basicStep', message: '모집 기간을 입력해주세요.' })
  } else if (new Date(recruitEndAt) <= new Date(recruitStartAt)) {
    errors.push({ field: 'basicStep', message: '모집 종료는 시작보다 뒤여야 해요.' })
  } else if (new Date(recruitEndAt) <= now) {
    errors.push({ field: 'basicStep', message: '모집 종료가 이미 지났어요.' })
  }
  if (activityStartedOn && activityEndedOn && activityEndedOn <= activityStartedOn) {
    errors.push({ field: 'basicStep', message: '활동 종료는 시작보다 뒤여야 해요.' })
  }
  if (!posting.noPosition && posting.positions.length === 0) {
    errors.push({ field: 'positionsStep', message: '모집 포지션을 1개 이상 추가해주세요.' })
  }
  if (posting.questions.length === 0) {
    errors.push({ field: 'questionsStep', message: '지원서 문항을 1개 이상 추가해주세요.' })
  }
  return errors
}

function toManagedPosting(posting: PostingDraftFieldsFragment, publishedAt: string | null) {
  return {
    id: posting.id,
    title: posting.title,
    status: posting.status,
    hasInterview: posting.hasInterview,
    publishedAt,
    recruitEndAt: posting.recruitEndAt,
    docResultAt: null,
    finalResultAt: null,
    docResultConfirmedAt: null,
    bumpRank: publishedAt ? PUBLISHED_BUMP_RANK : null,
  }
}

function errorBody(
  code: string,
  message: string,
  fieldErrors?: { field: string; message: string }[],
) {
  return { errors: [{ message, extensions: { code, fieldErrors } }], data: null }
}

const NOT_FOUND_ERROR = ['POSTING_404', '공고를 찾을 수 없습니다.'] as const

const postingDraftHandlers = [
  graphqlApi.query<PostingDraftQuery, PostingDraftQueryVariables>(
    'PostingDraft',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const record = findDraft(String(variables.id))

      if (!record) {
        return HttpResponse.json(errorBody(...NOT_FOUND_ERROR))
      }
      return HttpResponse.json({ data: { posting: record.posting } })
    },
  ),

  graphqlApi.mutation<SavePostingDraftMutation, SavePostingDraftMutationVariables>(
    'SavePostingDraft',
    async ({ variables: { organizationId, id, input } }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const organization = String(organizationId)

      if (!isManagingOrganization(organization)) {
        return HttpResponse.json(errorBody('COMMON_403', '접근 권한이 없습니다.'))
      }

      let record: DraftRecord
      if (id == null) {
        if (!input.title?.trim()) {
          return HttpResponse.json(errorBody('COMMON_400', '새 공고는 제목이 있어야 합니다.'))
        }
        const postingId = nextId('draft')
        record = {
          organizationId: organization,
          posting: createEmptyPosting(postingId, organization, input.title, false),
        }
      } else {
        const found = findDraft(String(id))
        if (!found || found.organizationId !== organization) {
          return HttpResponse.json(errorBody(...NOT_FOUND_ERROR))
        }
        if (found.posting.status !== 'DRAFT') {
          return HttpResponse.json(errorBody('POSTING_409', '작성 중인 공고만 저장할 수 있습니다.'))
        }
        record = found
      }

      const posting = applyInput(record.posting, input)
      if (hasUnknownPosition(input, posting)) {
        return HttpResponse.json(errorBody('COMMON_400', '이 공고의 포지션이 아닙니다.'))
      }

      drafts.set(posting.id, { organizationId: organization, posting })
      saveManagedPosting(organization, toManagedPosting(posting, null))
      return HttpResponse.json({ data: { savePostingDraft: posting } })
    },
  ),

  graphqlApi.mutation<PublishPostingMutation, PublishPostingMutationVariables>(
    'PublishPosting',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const record = findDraft(String(variables.id))

      if (!record) {
        return HttpResponse.json(errorBody(...NOT_FOUND_ERROR))
      }
      if (record.posting.status !== 'DRAFT') {
        return HttpResponse.json(errorBody('POSTING_409', '이미 게시된 공고입니다.'))
      }

      const fieldErrors = getPublishFieldErrors(record.posting, new Date())
      if (fieldErrors.length > 0) {
        return HttpResponse.json(errorBody('POSTING_400', '입력값을 확인해 주세요.', fieldErrors))
      }

      const posting = { ...record.posting, status: 'RECRUITING' as const }
      drafts.set(posting.id, { ...record, posting })
      saveManagedPosting(record.organizationId, toManagedPosting(posting, new Date().toISOString()))
      return HttpResponse.json({
        data: { publishPosting: { id: posting.id, status: posting.status } },
      })
    },
  ),
]

export { postingDraftHandlers, resetPostingDrafts }
