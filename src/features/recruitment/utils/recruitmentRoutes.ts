import type { Route } from 'next'

const POSTING_CREATE_PATH = '/manage/postings/new' satisfies Route

// typedRoutes는 리터럴만 검사, Next 문서 안내대로 Route 단언
function getDocumentReviewPath(postingId: string) {
  return `/manage/postings/${postingId}/documents` as Route
}

function getApplicantReviewPath(postingId: string, applicantId: string) {
  return `/manage/postings/${postingId}/documents/${applicantId}` as Route
}

function getDocumentResultPath(postingId: string) {
  return `/manage/postings/${postingId}/documents/summary` as Route
}

function getResultNoticePath(postingId: string) {
  return `/manage/postings/${postingId}/documents/summary/notice` as Route
}

function getInterviewTimetablePath(postingId: string) {
  return `/manage/postings/${postingId}/interviews/timetable` as Route
}

function getInterviewResultNoticePath(postingId: string) {
  return `/manage/postings/${postingId}/interviews/timetable/notice` as Route
}

function getPostingManageDetailPath(postingId: string) {
  return `/manage/postings/${postingId}` as Route
}

export {
  getApplicantReviewPath,
  getDocumentResultPath,
  getDocumentReviewPath,
  getInterviewResultNoticePath,
  getInterviewTimetablePath,
  getPostingManageDetailPath,
  getResultNoticePath,
  POSTING_CREATE_PATH,
}
