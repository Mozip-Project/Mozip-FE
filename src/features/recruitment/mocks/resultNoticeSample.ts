import type { ResultNoticeOverview } from '@/features/recruitment/types'

// TODO: 결과 안내 메시지 조회 연결 후 삭제, 단체명은 Figma 예시
const RESULT_NOTICE_SAMPLE = {
  organizationName: 'UXUX',
} satisfies ResultNoticeOverview

// TODO: 결과 안내 메시지 조회 연결 후 삭제, 기간은 임의 예시
const INTERVIEW_RESULT_NOTICE_SAMPLE = {
  ...RESULT_NOTICE_SAMPLE,
  interviewPeriod: '10/21 (수) ~ 10/23 (금)',
} satisfies ResultNoticeOverview

// TODO: 발송 API 연결 후 삭제, 전달 실패 안내 확인용(MSW 받는 사람 6번 주소)
const SEND_FAILED_SAMPLE = {
  email: 'applicant6@example.com',
  message: '메일 주소를 찾을 수 없어요',
}

export { INTERVIEW_RESULT_NOTICE_SAMPLE, RESULT_NOTICE_SAMPLE, SEND_FAILED_SAMPLE }
