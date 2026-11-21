import {
  APPLICANT_POSITION_TABS,
  DOCUMENT_REVIEW_SORTS,
  type ApplicantManagementQuery,
  type ApplicantPositionTab,
  type DocumentReviewSort,
} from '@/features/recruitment/types'
import type { SearchParamsSource } from '@/utils/searchParams'
import { getBoardHref, parseBoardQuery, type BoardQueryConfig } from './boardQuery'
import { getApplicantManagementPath } from './recruitmentRoutes'

const APPLICANT_MANAGEMENT_QUERY_CONFIG = {
  statuses: APPLICANT_POSITION_TABS,
  sorts: DOCUMENT_REVIEW_SORTS,
  defaultStatus: 'all',
  defaultSort: 'submittedDesc',
  statusParam: 'part',
} satisfies BoardQueryConfig<ApplicantPositionTab, DocumentReviewSort>

function parseApplicantManagementQuery(searchParams: SearchParamsSource): ApplicantManagementQuery {
  return parseBoardQuery(searchParams, APPLICANT_MANAGEMENT_QUERY_CONFIG)
}

function getApplicantManagementHref(postingId: string, query: ApplicantManagementQuery) {
  return getBoardHref(
    getApplicantManagementPath(postingId),
    query,
    APPLICANT_MANAGEMENT_QUERY_CONFIG,
  )
}

export { getApplicantManagementHref, parseApplicantManagementQuery }
