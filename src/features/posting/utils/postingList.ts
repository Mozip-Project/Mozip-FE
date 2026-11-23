import { ORGANIZATION_TYPE_LABEL } from '@/features/organization/utils/organizationProfile'
import {
  POSTING_ACTIVITY_FIELDS,
  POSTING_ACTIVITY_TYPES,
  type PostingActivityField,
  type PostingActivityType,
  type PostingListItem,
  type PostingListQuery,
  type PostingRecruitmentPhase,
  type PostingScope,
  type PostingSort,
} from '@/features/posting/types'
import { isAllFilterSelected } from '@/features/posting/utils/postingListQuery'
import { getPostingDetailPath } from '@/features/posting/utils/postingRoutes'
import type {
  OrganizationField,
  OrganizationType,
  PostingSort as PostingSortInput,
  PostingsQuery,
  PostingsQueryVariables,
} from '@/gql/graphql'
import { getDaysBetween, getSeoulIsoDate } from '@/utils/date'

type PostingCard = PostingsQuery['postings']['items'][number]
type PostingCardPosition = NonNullable<PostingCard['positions'][number]>

const POSTING_SORT_INPUT = {
  latest: 'LATEST',
  deadline: 'CLOSING_SOON',
} satisfies Record<PostingSort, PostingSortInput>

const ACTIVITY_FIELD_INPUT = {
  academic: 'ACADEMIC_STUDY',
  it: 'IT_DEV',
  design: 'DESIGN_MEDIA',
  performance: 'PERFORMANCE_MUSIC',
  sports: 'SPORTS',
  culture: 'CULTURE_HOBBY',
  volunteer: 'VOLUNTEER',
  language: 'LANGUAGE_GLOBAL',
  business: 'STARTUP_BUSINESS',
  religion: 'RELIGION',
  etc: 'ETC',
} satisfies Record<PostingActivityField, OrganizationField>

const ACTIVITY_TYPE_INPUT = {
  club: 'CLUB',
  society: 'ACADEMIC',
  studentCouncil: 'STUDENT_COUNCIL',
} satisfies Record<PostingActivityType, OrganizationType>

// 백엔드가 schoolId null을 연합만으로 처리한다고 가정, 안 보내면 전체
// TODO: 교내 공고에 넣을 학교 id 출처 정해지면 연결
function getSchoolIdFilter(scopes: PostingScope[]): { schoolId?: null } {
  const isUnionOnly = scopes.length === 1 && scopes[0] === 'union'
  return isUnionOnly ? { schoolId: null } : {}
}

// 안 고르거나 모두 고르면 보내지 않음, 모두 보내면 값이 없는 공고가 빠짐
function toFilterInput<TValue extends string, TInput>(
  values: readonly TValue[],
  allValues: readonly TValue[],
  inputByValue: Record<TValue, TInput>,
) {
  if (values.length === 0 || isAllFilterSelected(values, allValues)) {
    return undefined
  }
  return values.map((value) => inputByValue[value])
}

function toPostingsVariables(query: PostingListQuery, size: number): PostingsQueryVariables {
  const keyword = query.keyword.trim()

  return {
    filter: {
      keyword: keyword === '' ? undefined : keyword,
      organizationType: toFilterInput(
        query.activityTypes,
        POSTING_ACTIVITY_TYPES,
        ACTIVITY_TYPE_INPUT,
      ),
      fields: toFilterInput(query.activityFields, POSTING_ACTIVITY_FIELDS, ACTIVITY_FIELD_INPUT),
      ...getSchoolIdFilter(query.scopes),
    },
    sort: POSTING_SORT_INPUT[query.sort],
    page: query.page - 1,
    size,
  }
}

// 목록은 모집 중 공고만 와서 시작일 없이 모집 중으로 처리, 마감이 지났으면 당일로 고정
function getPostingCardPhase(recruitEndAt: string, now: Date): PostingRecruitmentPhase {
  const daysLeft = getDaysBetween(getSeoulIsoDate(now), getSeoulIsoDate(new Date(recruitEndAt)))
  return { status: 'open', daysLeft: Math.max(daysLeft, 0) }
}

// 명세상 목록 안 값이 null일 수 있어 제외, 응답 순서 대신 sortOrder 순
function getPostingCardPositionNames(positions: PostingCard['positions']) {
  return positions
    .filter((position): position is PostingCardPosition => position !== null)
    .toSorted((a, b) => a.sortOrder - b.sortOrder)
    .map((position) => position.name)
}

function toPostingListItem(card: PostingCard, now: Date): PostingListItem {
  return {
    id: card.id,
    href: getPostingDetailPath(card.id),
    title: card.title,
    organizationType: ORGANIZATION_TYPE_LABEL[card.organization.type],
    organizationName: card.organization.name,
    phase: getPostingCardPhase(card.recruitEndAt, now),
    tags: getPostingCardPositionNames(card.positions),
    thumbnailSrc: card.thumbnailUrl ?? undefined,
  }
}

function getPostingListTotalPages(totalCount: number, pageSize: number) {
  return Math.ceil(totalCount / pageSize)
}

export {
  getPostingCardPhase,
  getPostingCardPositionNames,
  getPostingListTotalPages,
  toPostingListItem,
  toPostingsVariables,
}
export type { PostingCard }
