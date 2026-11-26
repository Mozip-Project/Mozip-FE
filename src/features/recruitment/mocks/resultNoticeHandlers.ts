import { delay, HttpResponse } from 'msw'
import { UXUX_POSITIONS } from '@/features/posting/mocks/postingDetailHandlers'
import type {
  PostingStatus,
  ResultMessageRecipientFieldsFragment,
  ResultMessageRecipientsQuery,
  ResultMessageRecipientsQueryVariables,
} from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { MOCK_RESPONSE_DELAY_MS } from '@/mocks/responseDelay'
import {
  getEvaluationSummary,
  getPostingApplications,
  type PostingApplication,
} from './organizerApplicationStore'

// 이메일 경고 행 확인용 샘플 번호, 주소는 모두 가상
const SUSPICIOUS_EMAIL_SAMPLE = { sampleId: '1', email: 'applicant1@gmal.com', domain: 'gmail.com' }
const MISSING_EMAIL_SAMPLE_ID = '2'

// 타임테이블 확정 여부가 MSW에 없어 면접 단계 이후 공고를 확정으로 처리, 일시·장소는 Figma 예시
const TIMETABLE_CONFIRMED_STATUSES: readonly PostingStatus[] = ['INTERVIEW', 'FINAL_RESULT']
const INTERVIEW_SAMPLE = { startAt: '2026-10-21T13:00:00+09:00', location: '학생회관 301호' }

function errorBody(code: string, message: string) {
  return { errors: [{ message, extensions: { code } }], data: null }
}

const POSTING_NOT_FOUND_ERROR = ['POSTING_404', '공고를 찾을 수 없습니다.'] as const
const RESULT_NOT_CONFIRMED_ERROR = ['MESSAGE_409', '서류 결과가 확정되지 않았습니다.'] as const

function getEmailFields({
  sampleId,
}: PostingApplication): Pick<
  ResultMessageRecipientFieldsFragment,
  'email' | 'emailWarning' | 'suggestedDomain'
> {
  if (sampleId === SUSPICIOUS_EMAIL_SAMPLE.sampleId) {
    return {
      email: SUSPICIOUS_EMAIL_SAMPLE.email,
      emailWarning: 'SUSPICIOUS_DOMAIN',
      suggestedDomain: SUSPICIOUS_EMAIL_SAMPLE.domain,
    }
  }
  if (sampleId === MISSING_EMAIL_SAMPLE_ID) {
    return { email: null, emailWarning: 'MISSING', suggestedDomain: null }
  }
  return { email: `applicant${sampleId}@example.com`, emailWarning: null, suggestedDomain: null }
}

const resultNoticeHandlers = [
  // 받는 사람은 확정된 서류 결과가 합격·불합격인 지원자, 이름순
  graphqlApi.query<ResultMessageRecipientsQuery, ResultMessageRecipientsQueryVariables>(
    'ResultMessageRecipients',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      if (variables.type === 'NOTICE') {
        return HttpResponse.json(errorBody('COMMON_400', '공지는 결과 안내 대상이 아닙니다.'))
      }

      const found = getPostingApplications(String(variables.postingId))
      if (!found) {
        return HttpResponse.json(errorBody(...POSTING_NOT_FOUND_ERROR))
      }

      const { posting, sample, applications } = found
      if (!posting.docResultConfirmedAt) {
        return HttpResponse.json(errorBody(...RESULT_NOT_CONFIRMED_ERROR))
      }

      const hasConfirmedTimetable =
        posting.hasInterview && TIMETABLE_CONFIRMED_STATUSES.includes(posting.status)
      const sortedApplications = applications
        .map((application) => ({
          application,
          docResult: getEvaluationSummary(application, posting.status).docResult,
        }))
        .sort((a, b) => a.application.name.localeCompare(b.application.name, 'ko'))

      function toRecipients(docResult: 'PASS' | 'FAIL') {
        return sortedApplications
          .filter((item) => item.docResult === docResult)
          .map(({ application }) => ({
            application: {
              id: application.id,
              user: { name: application.name },
              position: sample.noPosition
                ? null
                : {
                    name:
                      UXUX_POSITIONS.find(({ id }) => id === application.positionId)?.name ?? '',
                  },
            },
            ...getEmailFields(application),
            interview: docResult === 'PASS' && hasConfirmedTimetable ? INTERVIEW_SAMPLE : null,
            delivery: null,
          }))
      }

      return HttpResponse.json({
        data: {
          resultMessages: {
            pass: { recipients: toRecipients('PASS') },
            fail: { recipients: toRecipients('FAIL') },
          },
        },
      })
    },
  ),
]

export { resultNoticeHandlers }
