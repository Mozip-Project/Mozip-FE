import type { Route } from 'next'

// typedRoutes는 리터럴만 검사, Next 문서 안내대로 Route 단언
function getPostingDetailPath(postingId: string) {
  return `/postings/${postingId}` as Route
}

function getPostingApplyPath(postingId: string) {
  return `/postings/${postingId}/apply` as Route
}

// 내 지원에서 여는 공고 상세
function getApplicationPostingDetailPath(postingId: string) {
  return `/applications/postings/${postingId}` as Route
}

export { getApplicationPostingDetailPath, getPostingApplyPath, getPostingDetailPath }
