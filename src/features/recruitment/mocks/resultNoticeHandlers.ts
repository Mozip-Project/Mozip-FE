import { delay, HttpResponse } from 'msw'
import { UXUX_POSITIONS } from '@/features/posting/mocks/postingDetailHandlers'
import type {
  MessageDeliveryStatus,
  MessageTarget,
  MessageVariable,
  PostingStatus,
  ResultMessageFieldsFragment,
  ResultMessagePanelFieldsFragment,
  ResultMessageProgressQuery,
  ResultMessageProgressQueryVariables,
  ResultMessageRecipientFieldsFragment,
  ResultMessagesFieldsFragment,
  ResultMessagesQuery,
  ResultMessagesQueryVariables,
  SaveMessageMutation,
  SaveMessageMutationVariables,
  SendMessagesMutation,
  SendMessagesMutationVariables,
} from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { MOCK_ORGANIZATION_NAME } from '@/mocks/mockOrganization'
import { MOCK_RESPONSE_DELAY_MS } from '@/mocks/responseDelay'
import { getTextLength } from '@/utils/text'
import {
  getEvaluationSummary,
  getPostingApplications,
  type PostingApplication,
} from './organizerApplicationStore'

type ResultTarget = Extract<MessageTarget, 'PASS' | 'FAIL'>
type PostingApplications = NonNullable<ReturnType<typeof getPostingApplications>>

const RESULT_TARGETS = ['PASS', 'FAIL'] as const satisfies readonly ResultTarget[]

// 이메일 경고 행 확인용 샘플 번호, 주소는 모두 가상
const SUSPICIOUS_EMAIL_SAMPLE = { sampleId: '1', email: 'applicant1@gmal.com', domain: 'gmail.com' }
const MISSING_EMAIL_SAMPLE_ID = '2'
// 전달 실패 안내 확인용
const DELIVERY_FAILED_SAMPLE = { sampleId: '6', reason: '메일 주소를 찾을 수 없어요' }

// 면접 단계 이후 공고를 타임테이블 확정으로 처리, 일시·장소는 Figma 예시
const TIMETABLE_CONFIRMED_STATUSES: readonly PostingStatus[] = ['INTERVIEW', 'FINAL_RESULT']
const INTERVIEW_SAMPLE = { startAt: '2026-10-21T13:00:00+09:00', location: '학생회관 301호' }
const INTERVIEW_DATES = ['2026-10-21', '2026-10-22', '2026-10-23']
const INTERVIEW_TOKEN_PATTERN = /\{면접 (일시|장소)\}/

// 폴링 몇 번에 걸쳐 진행률이 보이도록 천천히 처리
const MOCK_DELIVERY_INTERVAL_MS = 500

const SUBJECT_MAX_LENGTH = 100
const BODY_MAX_LENGTH = 1000

const POSITION_VARIABLES: readonly MessageVariable[] = ['POSITION']
const INTERVIEW_VARIABLES: readonly MessageVariable[] = [
  'INTERVIEW_PERIOD',
  'INTERVIEW_AT',
  'INTERVIEW_LOCATION',
]

type SendProgress = {
  startedAt: number
  // 이 순서대로 한 명씩 처리
  applicationIds: string[]
}

// 새로고침 전까지 메모리에 보관
const messages = new Map<string, ResultMessageFieldsFragment>()
const sendProgresses = new Map<string, SendProgress>()

function getMessageKey(postingId: string, target: ResultTarget) {
  return `${postingId}:${target}`
}

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

function hasConfirmedTimetable({ posting }: PostingApplications) {
  return posting.hasInterview && TIMETABLE_CONFIRMED_STATUSES.includes(posting.status)
}

// 시작 시각 기준 계산, 보내지 않은 지원자는 null
function getDeliveryStatus(
  progress: SendProgress | undefined,
  application: PostingApplication,
  now: number,
): MessageDeliveryStatus | null {
  const order = progress?.applicationIds.indexOf(application.id) ?? -1
  if (!progress || order === -1) {
    return null
  }
  if (now < progress.startedAt + (order + 1) * MOCK_DELIVERY_INTERVAL_MS) {
    return 'PENDING'
  }
  return application.sampleId === DELIVERY_FAILED_SAMPLE.sampleId ? 'FAILED' : 'SUCCESS'
}

function countDeliveries(
  recipients: readonly ResultMessageRecipientFieldsFragment[],
  status: MessageDeliveryStatus,
) {
  return recipients.filter(({ delivery }) => delivery?.status === status).length
}

// 받는 사람은 확정된 서류 결과가 합격·불합격인 지원자, 이름순
function buildResultMessages(
  postingId: string,
  found: PostingApplications,
): ResultMessagesFieldsFragment {
  const { posting, sample, applications } = found
  const isTimetableConfirmed = hasConfirmedTimetable(found)
  const now = Date.now()
  const sortedApplications = applications
    .map((application) => ({
      application,
      docResult: getEvaluationSummary(application, posting.status).docResult,
    }))
    .sort((a, b) => a.application.name.localeCompare(b.application.name, 'ko'))

  function toPanel(target: ResultTarget): ResultMessagePanelFieldsFragment {
    const key = getMessageKey(postingId, target)
    const progress = sendProgresses.get(key)
    const hasInterviewInfo = target === 'PASS' && isTimetableConfirmed
    const recipients = sortedApplications
      .filter((item) => item.docResult === target)
      .map(({ application }): ResultMessageRecipientFieldsFragment => {
        const deliveryStatus = getDeliveryStatus(progress, application, now)
        const emailFields = getEmailFields(application)

        return {
          application: {
            id: application.id,
            user: { name: application.name },
            position: sample.noPosition
              ? null
              : {
                  name: UXUX_POSITIONS.find(({ id }) => id === application.positionId)?.name ?? '',
                },
          },
          ...emailFields,
          interview: hasInterviewInfo ? INTERVIEW_SAMPLE : null,
          delivery: deliveryStatus && {
            status: deliveryStatus,
            failReason: deliveryStatus === 'FAILED' ? DELIVERY_FAILED_SAMPLE.reason : null,
          },
        }
      })
    const sendableCount = recipients.filter(({ emailWarning }) => !emailWarning).length
    const deliveredCount = countDeliveries(recipients, 'SUCCESS')
    const failedCount = countDeliveries(recipients, 'FAILED')
    const processedCount = deliveredCount + failedCount

    // 보낼 사람을 모두 처리하면 발송 완료
    const message = messages.get(key)
    if (message?.status === 'SENDING' && processedCount === progress?.applicationIds.length) {
      messages.set(key, { ...message, status: 'SENT' })
    }

    return {
      message: messages.get(key) ?? null,
      variables: [
        'NAME',
        ...(sample.noPosition ? [] : POSITION_VARIABLES),
        ...(hasInterviewInfo ? INTERVIEW_VARIABLES : []),
      ],
      recipientCount: recipients.length,
      sendableCount,
      processedCount,
      deliveredCount,
      failedCount,
      recipients,
    }
  }

  return {
    posting: {
      id: posting.id,
      organization: { name: MOCK_ORGANIZATION_NAME },
      interviewTimeRanges: posting.hasInterview ? INTERVIEW_DATES.map((date) => ({ date })) : [],
    },
    pass: toPanel('PASS'),
    fail: toPanel('FAIL'),
  }
}

function getMessageFieldErrors(subject: string, body: string) {
  const subjectLength = getTextLength(subject.trim())
  const bodyLength = getTextLength(body.trim())

  return [
    ...(subjectLength < 1 || subjectLength > SUBJECT_MAX_LENGTH
      ? [{ field: 'subject', message: '제목은 1~100자로 입력해 주세요.' }]
      : []),
    ...(bodyLength < 1 || bodyLength > BODY_MAX_LENGTH
      ? [{ field: 'body', message: '본문은 1~1,000자로 입력해 주세요.' }]
      : []),
  ]
}

// 명세의 발송 조건, 하나라도 어기면 전부 안 보냄
function getSendBlockError(
  postingId: string,
  found: PostingApplications,
  targets: readonly ResultTarget[],
) {
  const current = buildResultMessages(postingId, found)

  for (const target of targets) {
    const message = messages.get(getMessageKey(postingId, target))
    if (message?.status !== 'DRAFT') {
      return { code: 'MESSAGE_409', message: '저장된 초안이 없거나 이미 발송했습니다.' }
    }
    if (current[target === 'PASS' ? 'pass' : 'fail'].recipientCount === 0) {
      return { code: 'COMMON_400', message: '받는 사람이 없는 대상입니다.' }
    }
    if (
      target === 'PASS' &&
      INTERVIEW_TOKEN_PATTERN.test(message.body) &&
      !hasConfirmedTimetable(found)
    ) {
      return {
        code: 'MESSAGE_422',
        message: '면접 타임테이블이 확정되지 않았습니다.',
        reason: 'TIMETABLE_NOT_CONFIRMED',
      }
    }
  }
  return null
}

const resultNoticeHandlers = [
  graphqlApi.query<ResultMessagesQuery, ResultMessagesQueryVariables>(
    'ResultMessages',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      if (variables.type === 'NOTICE') {
        return HttpResponse.json(errorBody('COMMON_400', '공지는 결과 안내 대상이 아닙니다.'))
      }

      const postingId = String(variables.postingId)
      const found = getPostingApplications(postingId)
      if (!found) {
        return HttpResponse.json(errorBody(...POSTING_NOT_FOUND_ERROR))
      }
      if (!found.posting.docResultConfirmedAt) {
        return HttpResponse.json(errorBody(...RESULT_NOT_CONFIRMED_ERROR))
      }

      return HttpResponse.json({
        data: { resultMessages: buildResultMessages(postingId, found) },
      })
    },
  ),
  graphqlApi.query<ResultMessageProgressQuery, ResultMessageProgressQueryVariables>(
    'ResultMessageProgress',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const postingId = String(variables.postingId)
      const found = getPostingApplications(postingId)
      if (!found) {
        return HttpResponse.json(errorBody(...POSTING_NOT_FOUND_ERROR))
      }
      if (!found.posting.docResultConfirmedAt) {
        return HttpResponse.json(errorBody(...RESULT_NOT_CONFIRMED_ERROR))
      }

      const { pass, fail } = buildResultMessages(postingId, found)
      function toProgress({
        message,
        processedCount,
        deliveredCount,
        failedCount,
      }: ResultMessagePanelFieldsFragment) {
        return {
          message: message && { id: message.id, status: message.status },
          processedCount,
          deliveredCount,
          failedCount,
        }
      }

      return HttpResponse.json({
        data: { resultMessages: { pass: toProgress(pass), fail: toProgress(fail) } },
      })
    },
  ),
  graphqlApi.mutation<SaveMessageMutation, SaveMessageMutationVariables>(
    'SaveMessage',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const { type, target, subject, body } = variables
      if (type !== 'DOC_RESULT' || (target !== 'PASS' && target !== 'FAIL')) {
        return HttpResponse.json(errorBody('COMMON_400', '결과 안내 대상이 올바르지 않습니다.'))
      }

      const postingId = String(variables.postingId)
      const found = getPostingApplications(postingId)
      if (!found) {
        return HttpResponse.json(errorBody(...POSTING_NOT_FOUND_ERROR))
      }
      if (!found.posting.docResultConfirmedAt) {
        return HttpResponse.json(errorBody(...RESULT_NOT_CONFIRMED_ERROR))
      }

      const fieldErrors = getMessageFieldErrors(subject, body)
      if (fieldErrors.length > 0) {
        return HttpResponse.json({
          errors: [
            { message: '입력값을 확인해 주세요.', extensions: { code: 'COMMON_400', fieldErrors } },
          ],
          data: null,
        })
      }

      const key = getMessageKey(postingId, target)
      const savedStatus = messages.get(key)?.status
      if (savedStatus && savedStatus !== 'DRAFT') {
        return HttpResponse.json(errorBody('MESSAGE_409', '이미 발송한 메시지입니다.'))
      }

      const message = {
        id: `message-${postingId}-${target}`,
        status: 'DRAFT' as const,
        subject,
        body,
      }
      messages.set(key, message)

      return HttpResponse.json({ data: { saveMessage: message } })
    },
  ),
  graphqlApi.mutation<SendMessagesMutation, SendMessagesMutationVariables>(
    'SendMessages',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      // GraphQL의 리스트 입력은 단일 값으로도 전달할 수 있음
      const targets = Array.isArray(variables.targets) ? variables.targets : [variables.targets]
      const resultTargets = RESULT_TARGETS.filter((target) => targets.includes(target))
      const isValidTargets =
        variables.type === 'DOC_RESULT' &&
        targets.length > 0 &&
        new Set(targets).size === targets.length &&
        resultTargets.length === targets.length
      if (!isValidTargets) {
        return HttpResponse.json(errorBody('COMMON_400', '발송 대상이 올바르지 않습니다.'))
      }

      const postingId = String(variables.postingId)
      const found = getPostingApplications(postingId)
      if (!found) {
        return HttpResponse.json(errorBody(...POSTING_NOT_FOUND_ERROR))
      }
      if (!found.posting.docResultConfirmedAt) {
        return HttpResponse.json(errorBody(...RESULT_NOT_CONFIRMED_ERROR))
      }

      const blockError = getSendBlockError(postingId, found, resultTargets)
      if (blockError) {
        const { message, ...extensions } = blockError
        return HttpResponse.json({ errors: [{ message, extensions }], data: null })
      }

      // 이메일 경고 없는 받는 사람만 이름순으로 발송
      const current = buildResultMessages(postingId, found)
      const startedAt = Date.now()
      resultTargets.forEach((target) => {
        const key = getMessageKey(postingId, target)
        const message = messages.get(key)
        if (message) {
          messages.set(key, { ...message, status: 'SENDING' })
        }
        sendProgresses.set(key, {
          startedAt,
          applicationIds: current[target === 'PASS' ? 'pass' : 'fail'].recipients
            .filter(({ emailWarning }) => !emailWarning)
            .map(({ application }) => application.id),
        })
      })

      return HttpResponse.json({
        data: { sendMessages: buildResultMessages(postingId, found) },
      })
    },
  ),
]

export { resultNoticeHandlers }
