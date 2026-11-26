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

const POSTING_EDIT_PATH_PATTERN = /^\/manage\/postings\/([^/]+)\/edit$/

// 첫 저장은 주소만 편집 주소로 바꿔 라우트 params에 공고 ID가 없어 주소에서 읽음
function parsePostingEditPath(pathname: string) {
  return POSTING_EDIT_PATH_PATTERN.exec(pathname)?.[1]
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

export {
  INTERVIEW_SEARCH_PARAM,
  getNewPostingPath,
  getPostingEditPath,
  parseHasInterview,
  parsePostingEditPath,
}
