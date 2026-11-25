import {
  DOCUMENT_REVIEW_SORTS,
  DOCUMENT_REVIEW_STATUSES,
  type DocumentReviewQuery,
  type DocumentReviewSort,
  type DocumentReviewStatus,
} from '@/features/recruitment/types'
import type { SearchParamsSource } from '@/utils/searchParams'
import {
  getBoardHref,
  parseBoardQuery,
  parsePositionIds,
  type BoardQueryConfig,
} from './boardQuery'
import { getDocumentReviewPath } from './recruitmentRoutes'

const DOCUMENT_REVIEW_QUERY_CONFIG = {
  statuses: DOCUMENT_REVIEW_STATUSES,
  sorts: DOCUMENT_REVIEW_SORTS,
  defaultStatus: 'all',
  defaultSort: 'submittedDesc',
  isPositionFiltered: (positions) => positions.length > 0,
} satisfies BoardQueryConfig<DocumentReviewStatus, DocumentReviewSort, string>

function parseDocumentReviewQuery(searchParams: SearchParamsSource): DocumentReviewQuery {
  return {
    ...parseBoardQuery(searchParams, DOCUMENT_REVIEW_QUERY_CONFIG),
    positions: parsePositionIds(searchParams),
  }
}

function getDocumentReviewHref(postingId: string, query: DocumentReviewQuery) {
  return getBoardHref(getDocumentReviewPath(postingId), query, DOCUMENT_REVIEW_QUERY_CONFIG)
}

export { getDocumentReviewHref, parseDocumentReviewQuery }
