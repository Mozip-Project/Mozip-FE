import {
  DOCUMENT_REVIEW_POSITIONS,
  type DocumentReviewPosition,
  type DocumentReviewSort,
  type RecruitmentBoardQuery,
} from '@/features/recruitment/types'
import type { ApplicationSort } from '@/gql/graphql'
import { isOneOf } from '@/utils/isOneOf'
import {
  getHrefWithSearchParams,
  getPageParam,
  getParamValues,
  type SearchParamsSource,
} from '@/utils/searchParams'
import type { Route } from 'next'

type BoardQueryConfig<
  TStatus extends string,
  TSort extends string,
  TPosition extends string = DocumentReviewPosition,
> = {
  statuses: readonly TStatus[]
  sorts: readonly TSort[]
  defaultStatus: TStatus
  defaultSort: TSort
  // 탭이 상태가 아닌 화면용 URL 이름, 포지션 필터의 position과 겹치지 않게 지정
  statusParam?: string
  // 생략하면 고정 포지션 기준, 모두 고른 상태가 전체
  isPositionFiltered?: (positions: readonly TPosition[]) => boolean
}

const DEFAULT_STATUS_PARAM = 'status'
const POSITION_PARAM = 'position'

// 지원자 관리·서류 평가가 같은 정렬 enum 사용
const APPLICATION_SORT = {
  submittedDesc: 'SUBMITTED_DESC',
  submittedAsc: 'SUBMITTED_ASC',
  nameAsc: 'NAME_ASC',
  nameDesc: 'NAME_DESC',
} satisfies Record<DocumentReviewSort, ApplicationSort>

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

function hasPositionFilter(positions: readonly string[]) {
  return positions.length < DOCUMENT_REVIEW_POSITIONS.length
}

// 포지션 ID 화면용, 공고 포지션인지는 서버가 검사
function parsePositionIds(searchParams: SearchParamsSource) {
  return getParamValues(searchParams, POSITION_PARAM)
}

// 직접 입력한 URL 등 범위 밖 값은 기본값으로 처리
function parseBoardQuery<TStatus extends string, TSort extends string>(
  searchParams: SearchParamsSource,
  config: BoardQueryConfig<TStatus, TSort>,
): RecruitmentBoardQuery<TStatus, TSort> {
  const [status] = getParamValues(searchParams, config.statusParam ?? DEFAULT_STATUS_PARAM)
  const [sort] = getParamValues(searchParams, 'sort')
  const [keyword = ''] = getParamValues(searchParams, 'q')
  const positions = DOCUMENT_REVIEW_POSITIONS.filter((position) =>
    getParamValues(searchParams, POSITION_PARAM).includes(position),
  )

  return {
    status: isOneOf(config.statuses, status) ? status : config.defaultStatus,
    positions: positions.length > 0 ? positions : DOCUMENT_REVIEW_POSITIONS,
    sort: isOneOf(config.sorts, sort) ? sort : config.defaultSort,
    keyword,
    page: getPageParam(searchParams),
  }
}

// 기본값은 생략해 첫 진입 URL과 같은 주소 유지
function getBoardHref<TStatus extends string, TSort extends string, TPosition extends string>(
  pathname: string,
  query: RecruitmentBoardQuery<TStatus, TSort, TPosition>,
  config: BoardQueryConfig<TStatus, TSort, TPosition>,
): Route {
  const searchParams = new URLSearchParams()
  const isPositionFiltered = config.isPositionFiltered ?? hasPositionFilter

  if (query.status !== config.defaultStatus) {
    searchParams.set(config.statusParam ?? DEFAULT_STATUS_PARAM, query.status)
  }
  if (isPositionFiltered(query.positions)) {
    query.positions.forEach((position) => searchParams.append(POSITION_PARAM, position))
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

  return getHrefWithSearchParams(pathname, searchParams)
}

export {
  APPLICATION_SORT,
  getBoardHref,
  getBoardSortOptions,
  getBoardStatusTabs,
  parseBoardQuery,
  parsePositionIds,
}
export type { BoardQueryConfig }
