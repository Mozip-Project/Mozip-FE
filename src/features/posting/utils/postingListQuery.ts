import {
  POSTING_ACTIVITY_FIELDS,
  POSTING_ACTIVITY_TYPES,
  POSTING_SCOPES,
  POSTING_SORTS,
  type PostingListQuery,
  type PostingSort,
} from '@/features/posting/types'
import { isOneOf } from '@/utils/isOneOf'
import {
  getHrefWithSearchParams,
  getPageParam,
  getParamValues,
  type SearchParamsSource,
} from '@/utils/searchParams'
import type { Route } from 'next'

const DEFAULT_POSTING_SORT: PostingSort = 'latest'

function pickAllowedValues<TValue extends string>(
  allowedValues: readonly TValue[],
  values: readonly string[],
) {
  return allowedValues.filter((value) => values.includes(value))
}

function parsePostingListQuery(searchParams: SearchParamsSource): PostingListQuery {
  const [keyword = ''] = getParamValues(searchParams, 'q')
  const [sort] = getParamValues(searchParams, 'sort')

  return {
    scopes: pickAllowedValues(POSTING_SCOPES, getParamValues(searchParams, 'scope')),
    activityTypes: pickAllowedValues(POSTING_ACTIVITY_TYPES, getParamValues(searchParams, 'type')),
    activityFields: pickAllowedValues(
      POSTING_ACTIVITY_FIELDS,
      getParamValues(searchParams, 'field'),
    ),
    keyword,
    sort: isOneOf(POSTING_SORTS, sort) ? sort : DEFAULT_POSTING_SORT,
    page: getPageParam(searchParams),
  }
}

function getPostingListHref(pathname: string, query: PostingListQuery): Route {
  const searchParams = new URLSearchParams()

  query.scopes.forEach((scope) => searchParams.append('scope', scope))
  query.activityTypes.forEach((type) => searchParams.append('type', type))
  query.activityFields.forEach((field) => searchParams.append('field', field))

  if (query.keyword !== '') {
    searchParams.set('q', query.keyword)
  }
  if (query.sort !== DEFAULT_POSTING_SORT) {
    searchParams.set('sort', query.sort)
  }
  if (query.page > 1) {
    searchParams.set('page', String(query.page))
  }

  return getHrefWithSearchParams(pathname, searchParams)
}

export { getPostingListHref, parsePostingListQuery }
