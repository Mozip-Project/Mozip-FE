import {
  APPLICANT_ALL_POSITIONS_TAB,
  DOCUMENT_REVIEW_SORTS,
  type ApplicantManagementQuery,
  type ApplicantPositionTab,
  type DocumentReviewSort,
} from '@/features/recruitment/types'
import type { ApplicationSort, PostingApplicationsQueryVariables } from '@/gql/graphql'
import { getParamValues, type SearchParamsSource } from '@/utils/searchParams'
import { getBoardHref, parseBoardQuery, type BoardQueryConfig } from './boardQuery'
import { getApplicantManagementPath } from './recruitmentRoutes'

const POSITION_PARAM = 'part'

// 포지션 탭은 공고마다 달라 전체 탭만 고정 값으로 검사
const APPLICANT_MANAGEMENT_QUERY_CONFIG = {
  statuses: [APPLICANT_ALL_POSITIONS_TAB],
  sorts: DOCUMENT_REVIEW_SORTS,
  defaultStatus: APPLICANT_ALL_POSITIONS_TAB,
  defaultSort: 'submittedDesc',
  statusParam: POSITION_PARAM,
} satisfies BoardQueryConfig<ApplicantPositionTab, DocumentReviewSort>

const APPLICATION_SORT = {
  submittedDesc: 'SUBMITTED_DESC',
  submittedAsc: 'SUBMITTED_ASC',
  nameAsc: 'NAME_ASC',
  nameDesc: 'NAME_DESC',
} satisfies Record<DocumentReviewSort, ApplicationSort>

// 없는 포지션 ID는 서버 응답의 탭과 맞지 않아 선택된 탭 없이 표시
function parseApplicantManagementQuery(searchParams: SearchParamsSource): ApplicantManagementQuery {
  const [positionId] = getParamValues(searchParams, POSITION_PARAM)

  return {
    ...parseBoardQuery(searchParams, APPLICANT_MANAGEMENT_QUERY_CONFIG),
    status: positionId || APPLICANT_ALL_POSITIONS_TAB,
  }
}

function getApplicantManagementHref(postingId: string, query: ApplicantManagementQuery) {
  return getBoardHref(
    getApplicantManagementPath(postingId),
    query,
    APPLICANT_MANAGEMENT_QUERY_CONFIG,
  )
}

// 빈 검색어는 생략해 전체 조회
function toPostingApplicationsVariables(
  postingId: string,
  query: ApplicantManagementQuery,
): PostingApplicationsQueryVariables {
  const keyword = query.keyword.trim()

  return {
    postingId,
    positionId: query.status === APPLICANT_ALL_POSITIONS_TAB ? null : query.status,
    keyword: keyword === '' ? null : keyword,
    sort: APPLICATION_SORT[query.sort],
    page: query.page,
  }
}

export { getApplicantManagementHref, parseApplicantManagementQuery, toPostingApplicationsVariables }
