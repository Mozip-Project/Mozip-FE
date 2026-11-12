import type { ResultNoticeMessage } from '@/features/recruitment/types'

// Figma 공지 보내기 기본 입력값, 실제 기본 문구 확정 전 샘플
const POSTING_NOTICE_SAMPLE_MESSAGE: ResultNoticeMessage = {
  subject: '14기 모집 일정 변경 안내',
  body: `{이름}님, {공고명}에 지원해 주셔서 감사합니다.
지원자가 예상보다 많아 모집 기간을 10월 20일(화)까지 연장하고, 서류 결과 안내도 10월 23일(금)로 미뤄졌어요.

궁금한 점은 언제든 문의해 주세요.`,
}

export { POSTING_NOTICE_SAMPLE_MESSAGE }
