import type { Route } from 'next'

// 서버 page의 searchParams와 클라이언트 useSearchParams 모두 지원
type SearchParamsSource = Record<string, string | string[] | undefined> | URLSearchParams

function getParamValues(searchParams: SearchParamsSource, key: string) {
  if (searchParams instanceof URLSearchParams) {
    return searchParams.getAll(key)
  }

  const value = searchParams[key]

  if (value === undefined) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

// 직접 입력한 URL 등 1보다 작거나 숫자가 아닌 값은 1페이지
function getPageParam(searchParams: SearchParamsSource) {
  const page = Math.trunc(Number(getParamValues(searchParams, 'page')[0]))

  return Number.isFinite(page) && page > 1 ? page : 1
}

// 쿼리가 비면 경로만 반환
function getHrefWithSearchParams(pathname: string, searchParams: URLSearchParams): Route {
  const queryString = searchParams.toString()
  const href = queryString ? `${pathname}?${queryString}` : pathname

  // typedRoutes는 리터럴만 검사, Next 문서 안내대로 Route 단언
  return href as Route
}

export { getHrefWithSearchParams, getPageParam, getParamValues }
export type { SearchParamsSource }
