import {
  DOCUMENT_RESULT_SORTS,
  DOCUMENT_RESULT_STATUSES,
  type DocumentResultQuery,
  type DocumentResultSort,
  type DocumentResultStatus,
} from '@/features/recruitment/types'
import type { SearchParamsSource } from '@/utils/searchParams'
import {
  getBoardHref,
  parseBoardQuery,
  parsePositionIds,
  type BoardQueryConfig,
} from './boardQuery'
import { getDocumentResultPath } from './recruitmentRoutes'

const DOCUMENT_RESULT_QUERY_CONFIG = {
  statuses: DOCUMENT_RESULT_STATUSES,
  sorts: DOCUMENT_RESULT_SORTS,
  defaultStatus: 'all',
  defaultSort: 'rankDesc',
  isPositionFiltered: (positions) => positions.length > 0,
} satisfies BoardQueryConfig<DocumentResultStatus, DocumentResultSort, string>

function parseDocumentResultQuery(searchParams: SearchParamsSource): DocumentResultQuery {
  return {
    ...parseBoardQuery(searchParams, DOCUMENT_RESULT_QUERY_CONFIG),
    positions: parsePositionIds(searchParams),
  }
}

function getDocumentResultHref(postingId: string, query: DocumentResultQuery) {
  return getBoardHref(getDocumentResultPath(postingId), query, DOCUMENT_RESULT_QUERY_CONFIG)
}

export { getDocumentResultHref, parseDocumentResultQuery }
