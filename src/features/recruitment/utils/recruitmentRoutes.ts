import type { Route } from 'next'

// typedRoutes는 리터럴만 검사, Next 문서 안내대로 Route 단언
function getDocumentReviewPath(recruitmentId: string) {
  return `/manage/recruitments/${recruitmentId}/documents` as Route
}

function getApplicantReviewPath(recruitmentId: string, applicantId: string) {
  return `/manage/recruitments/${recruitmentId}/documents/${applicantId}` as Route
}

function getDocumentResultPath(recruitmentId: string) {
  return `/manage/recruitments/${recruitmentId}/documents/summary` as Route
}

function getResultNoticePath(recruitmentId: string) {
  return `/manage/recruitments/${recruitmentId}/documents/summary/notice` as Route
}

export { getApplicantReviewPath, getDocumentResultPath, getDocumentReviewPath, getResultNoticePath }
