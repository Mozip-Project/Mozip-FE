import type { DocumentReviewPosition, RecruitmentSchedule } from '@/features/recruitment/types'

// TODO: postingApplications 연결 후 삭제, 지원자는 서류 평가 취합 샘플을 함께 사용

const SAMPLE_FIRST_SUBMITTED_AT = Date.UTC(2026, 9, 15, 12)
const SAMPLE_SUBMIT_INTERVAL_MS = 60 * 60 * 1000

// 목록 순서대로 1시간씩 앞선 제출 시각
function getSampleSubmittedAt(index: number) {
  return new Date(SAMPLE_FIRST_SUBMITTED_AT - index * SAMPLE_SUBMIT_INTERVAL_MS)
    .toISOString()
    .slice(0, 16)
}

const APPLICANT_MANAGEMENT_SCHEDULE_SAMPLE: RecruitmentSchedule = {
  postingCompletedAt: '2026-10-01',
  applicationDeadline: '2026-10-15',
  documentReviewCompletedAt: null,
  documentResultDate: '2026-10-18',
  finalResultDate: '2026-10-27',
}

// 지원 접수 중 화면 확인용 공고와 포지션별 인원
const APPLICATION_STAGE_POSTING_ID = '2'
const APPLICATION_STAGE_COUNTS: Record<DocumentReviewPosition, number> = {
  design: 13,
  development: 15,
  planning: 4,
}

// 지원 접수 중 지원자 0명 화면 확인용 공고
const NO_APPLICANT_POSTING_ID = '5'

export {
  APPLICANT_MANAGEMENT_SCHEDULE_SAMPLE,
  APPLICATION_STAGE_COUNTS,
  APPLICATION_STAGE_POSTING_ID,
  getSampleSubmittedAt,
  NO_APPLICANT_POSTING_ID,
}
