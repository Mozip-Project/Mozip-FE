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

export { RESULT_NOTICE_SAMPLE }
