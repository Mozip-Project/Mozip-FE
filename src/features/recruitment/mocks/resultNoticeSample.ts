import { DOCUMENT_RESULT_SAMPLE } from '@/features/recruitment/api/documentResultSample'
import type {
  ResultNoticeOverview,
  ResultNoticeRecipient,
  ResultNoticeTarget,
} from '@/features/recruitment/types'

// 이메일 확인 필요 행 확인용, 주소는 모두 가상
const EMAIL_CHECK_SAMPLE = {
  applicantId: '1',
  email: 'applicant1@gmal.com',
  message: 'gmail.com이 맞나요?',
}

function getRecipientsSample(result: ResultNoticeTarget): ResultNoticeRecipient[] {
  return DOCUMENT_RESULT_SAMPLE.filter((applicant) => applicant.result === result).map(
    ({ id, name, position }) => {
      if (id === EMAIL_CHECK_SAMPLE.applicantId) {
        return {
          id,
          name,
          position,
          email: EMAIL_CHECK_SAMPLE.email,
          delivery: { status: 'emailCheck', message: EMAIL_CHECK_SAMPLE.message },
        }
      }

      return {
        id,
        name,
        position,
        email: `applicant${id}@example.com`,
        delivery: { status: 'pending' },
      }
    },
  )
}

// TODO: 결과 안내 API 확정 후 삭제, 단체명은 Figma 예시, 받는 사람은 서류 결과 샘플의 합격·불합격자
const RESULT_NOTICE_SAMPLE = {
  organizationName: 'UXUX',
  recipients: {
    pass: getRecipientsSample('pass'),
    fail: getRecipientsSample('fail'),
  },
} satisfies ResultNoticeOverview

// TODO: 면접 타임테이블 API 확정 후 삭제, 일시·장소는 Figma 예시, 기간은 임의 예시
const INTERVIEW_SCHEDULE_SAMPLE = {
  dateTime: '10/21 (수) 13:00',
  place: '학생회관 301호',
}

// 타임테이블은 합격자만 대상
const INTERVIEW_RESULT_NOTICE_SAMPLE = {
  ...RESULT_NOTICE_SAMPLE,
  interviewPeriod: '10/21 (수) ~ 10/23 (금)',
  recipients: {
    pass: RESULT_NOTICE_SAMPLE.recipients.pass.map((recipient) => ({
      ...recipient,
      interviewSchedule: INTERVIEW_SCHEDULE_SAMPLE,
    })),
    fail: RESULT_NOTICE_SAMPLE.recipients.fail,
  },
} satisfies ResultNoticeOverview

// TODO: 발송 API 연결 후 삭제, 전달 실패 안내 확인용
const SEND_FAILED_SAMPLE = {
  applicantId: '6',
  message: '메일 주소를 찾을 수 없어요',
}

export { INTERVIEW_RESULT_NOTICE_SAMPLE, RESULT_NOTICE_SAMPLE, SEND_FAILED_SAMPLE }
