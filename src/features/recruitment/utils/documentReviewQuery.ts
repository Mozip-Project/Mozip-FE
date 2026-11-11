import {
  DOCUMENT_REVIEW_SORTS,
  DOCUMENT_REVIEW_STATUSES,
  type DocumentReviewQuery,
  type DocumentReviewSort,
  type DocumentReviewStatus,
} from '@/features/recruitment/types'
import type { SearchParamsSource } from '@/utils/searchParams'
import { getBoardHref, parseBoardQuery, type BoardQueryConfig } from './boardQuery'
import { getDocumentReviewPath } from './recruitmentRoutes'

const DOCUMENT_REVIEW_QUERY_CONFIG = {
  statuses: DOCUMENT_REVIEW_STATUSES,
  sorts: DOCUMENT_REVIEW_SORTS,
  defaultStatus: 'all',
  defaultSort: 'submittedDesc',
} satisfies BoardQueryConfig<DocumentReviewStatus, DocumentReviewSort>

function parseDocumentReviewQuery(searchParams: SearchParamsSource): DocumentReviewQuery {
  return parseBoardQuery(searchParams, DOCUMENT_REVIEW_QUERY_CONFIG)
}

function getDocumentReviewHref(recruitmentId: string, query: DocumentReviewQuery) {
  return getBoardHref(getDocumentReviewPath(recruitmentId), query, DOCUMENT_REVIEW_QUERY_CONFIG)
}

export { getDocumentReviewHref, parseDocumentReviewQuery }
