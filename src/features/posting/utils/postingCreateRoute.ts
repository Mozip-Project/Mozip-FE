import { POSTING_CREATE_PATH } from '@/features/recruitment/utils/recruitmentRoutes'
import type { Route } from 'next'

const INTERVIEW_SEARCH_PARAM = 'interview'

function getNewPostingPath(hasInterview: boolean) {
  return `${POSTING_CREATE_PATH}?${INTERVIEW_SEARCH_PARAM}=${hasInterview}` as Route
}

// 저장된 작성 중 공고를 이어서 작성하는 주소
function getPostingEditPath(postingId: string) {
  return `/manage/postings/${postingId}/edit` as Route
}

function parseHasInterview(value: string | string[] | undefined) {
  if (value === 'true') {
    return true
  }
  if (value === 'false') {
    return false
  }
  return null
}

export { INTERVIEW_SEARCH_PARAM, getNewPostingPath, getPostingEditPath, parseHasInterview }
