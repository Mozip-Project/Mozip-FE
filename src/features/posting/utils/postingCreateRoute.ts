import { POSTING_CREATE_PATH } from '@/features/recruitment/utils/recruitmentRoutes'
import type { Route } from 'next'

const INTERVIEW_SEARCH_PARAM = 'interview'

function getNewPostingPath(hasInterview: boolean) {
  return `${POSTING_CREATE_PATH}?${INTERVIEW_SEARCH_PARAM}=${hasInterview}` as Route
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

export { INTERVIEW_SEARCH_PARAM, getNewPostingPath, parseHasInterview }
