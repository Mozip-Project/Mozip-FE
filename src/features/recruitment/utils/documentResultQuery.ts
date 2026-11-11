import {
  DOCUMENT_RESULT_SORTS,
  DOCUMENT_RESULT_STATUSES,
  type DocumentResultQuery,
  type DocumentResultSort,
  type DocumentResultStatus,
} from '@/features/recruitment/types'
import type { SearchParamsSource } from '@/utils/searchParams'
import { getBoardHref, parseBoardQuery, type BoardQueryConfig } from './boardQuery'
import { getDocumentResultPath } from './recruitmentRoutes'

const DOCUMENT_RESULT_QUERY_CONFIG = {
  statuses: DOCUMENT_RESULT_STATUSES,
  sorts: DOCUMENT_RESULT_SORTS,
  defaultStatus: 'all',
  defaultSort: 'rankDesc',
} satisfies BoardQueryConfig<DocumentResultStatus, DocumentResultSort>

function parseDocumentResultQuery(searchParams: SearchParamsSource): DocumentResultQuery {
  return parseBoardQuery(searchParams, DOCUMENT_RESULT_QUERY_CONFIG)
}

function getDocumentResultHref(recruitmentId: string, query: DocumentResultQuery) {
  return getBoardHref(getDocumentResultPath(recruitmentId), query, DOCUMENT_RESULT_QUERY_CONFIG)
}

export { getDocumentResultHref, parseDocumentResultQuery }
