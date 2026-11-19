import type { Route } from 'next'

// typedRoutes는 리터럴만 검사, Next 문서 안내대로 Route 단언
function getPostingDetailPath(postingId: string) {
  return `/postings/${postingId}` as Route
}

export { getPostingDetailPath }
