import {
  DOCUMENT_REVIEW_POSITIONS,
  type DocumentReviewPosition,
  type RecruitmentBoardQuery,
} from '@/features/recruitment/types'
import { isOneOf } from '@/utils/isOneOf'
import type { Route } from 'next'

// 서버 page의 searchParams와 클라이언트 useSearchParams 모두 지원
type BoardSearchParams = Record<string, string | string[] | undefined> | URLSearchParams

type BoardQueryConfig<TStatus extends string, TSort extends string> = {
  statuses: readonly TStatus[]
  sorts: readonly TSort[]
  defaultStatus: TStatus
  defaultSort: TSort
}

function getParamValues(searchParams: BoardSearchParams, key: string) {
  if (searchParams instanceof URLSearchParams) {
    return searchParams.getAll(key)
  }

  const value = searchParams[key]

  if (value === undefined) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

function getBoardSortOptions<TSort extends string>(
  sorts: readonly TSort[],
  labels: Record<TSort, string>,
) {
  return sorts.map((sort) => ({ value: sort, label: labels[sort] }))
}

// counts가 null이면 첫 진입 로딩 중
function getBoardStatusTabs<TStatus extends string>(
  statuses: readonly TStatus[],
  labels: Record<TStatus, string>,
  counts: Record<TStatus, number> | null,
) {
  return statuses.map((status) => ({
    value: status,
    label: labels[status],
    count: counts ? counts[status] : null,
  }))
}

function hasPositionFilter(positions: readonly DocumentReviewPosition[]) {
  return positions.length < DOCUMENT_REVIEW_POSITIONS.length
}

// 직접 입력한 URL 등 범위 밖 값은 기본값으로 처리
function parseBoardQuery<TStatus extends string, TSort extends string>(
  searchParams: BoardSearchParams,
  config: BoardQueryConfig<TStatus, TSort>,
): RecruitmentBoardQuery<TStatus, TSort> {
  const [status] = getParamValues(searchParams, 'status')
  const [sort] = getParamValues(searchParams, 'sort')
  const [keyword = ''] = getParamValues(searchParams, 'q')
  const page = Math.trunc(Number(getParamValues(searchParams, 'page')[0]))
  const positions = DOCUMENT_REVIEW_POSITIONS.filter((position) =>
    getParamValues(searchParams, 'position').includes(position),
  )

  return {
    status: isOneOf(config.statuses, status) ? status : config.defaultStatus,
    positions: positions.length > 0 ? positions : DOCUMENT_REVIEW_POSITIONS,
    sort: isOneOf(config.sorts, sort) ? sort : config.defaultSort,
    keyword,
    page: Number.isFinite(page) && page > 1 ? page : 1,
  }
}

// 기본값은 생략해 첫 진입 URL과 같은 주소 유지
function getBoardHref<TStatus extends string, TSort extends string>(
  pathname: string,
  query: RecruitmentBoardQuery<TStatus, TSort>,
  config: BoardQueryConfig<TStatus, TSort>,
): Route {
  const searchParams = new URLSearchParams()

  if (query.status !== config.defaultStatus) {
    searchParams.set('status', query.status)
  }
  if (hasPositionFilter(query.positions)) {
    query.positions.forEach((position) => searchParams.append('position', position))
  }
  if (query.sort !== config.defaultSort) {
    searchParams.set('sort', query.sort)
  }
  if (query.keyword !== '') {
    searchParams.set('q', query.keyword)
  }
  if (query.page > 1) {
    searchParams.set('page', String(query.page))
  }

  const queryString = searchParams.toString()
  const href = queryString ? `${pathname}?${queryString}` : pathname

  // typedRoutes는 리터럴만 검사, Next 문서 안내대로 Route 단언
  return href as Route
}

export { getBoardHref, getBoardSortOptions, getBoardStatusTabs, hasPositionFilter, parseBoardQuery }
export type { BoardQueryConfig, BoardSearchParams }
