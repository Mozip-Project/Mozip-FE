import {
  DOCUMENT_REVIEW_POSITIONS,
  DOCUMENT_REVIEW_SORTS,
  DOCUMENT_REVIEW_STATUSES,
  type DocumentReviewQuery,
} from '@/features/recruitment/api/organizer'
import type { Route } from 'next'

type SearchParams = Record<string, string | string[] | undefined>

const DEFAULT_QUERY = {
  status: 'all',
  positions: DOCUMENT_REVIEW_POSITIONS,
  sort: 'submittedDesc',
  keyword: '',
  page: 1,
} satisfies DocumentReviewQuery

function toArray(value: string | string[] | undefined) {
  if (value === undefined) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

function isOneOf<TValue extends string>(
  values: readonly TValue[],
  value: unknown,
): value is TValue {
  return values.some((item) => item === value)
}

// 직접 입력한 URL 등 범위 밖 값은 기본값으로 처리
function parseDocumentReviewQuery(searchParams: SearchParams): DocumentReviewQuery {
  const [status] = toArray(searchParams.status)
  const [sort] = toArray(searchParams.sort)
  const [keyword = ''] = toArray(searchParams.q)
  const page = Math.trunc(Number(toArray(searchParams.page)[0]))
  const positions = DOCUMENT_REVIEW_POSITIONS.filter((position) =>
    toArray(searchParams.position).includes(position),
  )

  return {
    status: isOneOf(DOCUMENT_REVIEW_STATUSES, status) ? status : DEFAULT_QUERY.status,
    positions: positions.length > 0 ? positions : DEFAULT_QUERY.positions,
    sort: isOneOf(DOCUMENT_REVIEW_SORTS, sort) ? sort : DEFAULT_QUERY.sort,
    keyword,
    page: Number.isFinite(page) && page > 1 ? page : DEFAULT_QUERY.page,
  }
}

// 기본값은 생략해 첫 진입 URL과 같은 주소 유지
function getDocumentReviewHref(recruitmentId: string, query: DocumentReviewQuery): Route {
  const searchParams = new URLSearchParams()
  const isAllPositions = query.positions.length === DOCUMENT_REVIEW_POSITIONS.length

  if (query.status !== DEFAULT_QUERY.status) {
    searchParams.set('status', query.status)
  }
  if (!isAllPositions) {
    query.positions.forEach((position) => searchParams.append('position', position))
  }
  if (query.sort !== DEFAULT_QUERY.sort) {
    searchParams.set('sort', query.sort)
  }
  if (query.keyword !== '') {
    searchParams.set('q', query.keyword)
  }
  if (query.page > 1) {
    searchParams.set('page', String(query.page))
  }

  const queryString = searchParams.toString()
  const pathname = `/manage/recruitments/${recruitmentId}/documents`
  const href = queryString ? `${pathname}?${queryString}` : pathname

  // typedRoutes는 리터럴만 검사하므로 Next 문서 안내대로 조합한 경로를 Route로 단언
  return href as Route
}

export { getDocumentReviewHref, parseDocumentReviewQuery }
