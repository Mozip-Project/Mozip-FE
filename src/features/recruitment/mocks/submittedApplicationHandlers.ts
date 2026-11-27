import { delay, HttpResponse } from 'msw'
import { createPostingSample } from '@/features/posting/mocks/postingDetailHandlers'
import type {
  MyApplicationsQuery,
  MyApplicationsQueryVariables,
  SubmittedApplicationQuery,
  SubmittedApplicationQueryVariables,
} from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { MOCK_RESPONSE_DELAY_MS } from '@/mocks/responseDelay'
import { getSeoulIsoDate } from '@/utils/date'
import {
  applicantApplications,
  createApplicationFormSample,
  getApplicationProgress,
} from './applicantApplicationStore'

const APPLICATION_NOT_FOUND_RESPONSE = {
  errors: [{ message: '지원서를 찾을 수 없습니다.', extensions: { code: 'APPLICATION_404' } }],
  data: null,
}

type MyApplicationResponse = MyApplicationsQuery['myApplications'][number]

// 지원서 작성 MSW에서 저장·제출한 지원서를 그대로 조회
const submittedApplicationHandlers = [
  graphqlApi.query<MyApplicationsQuery, MyApplicationsQueryVariables>(
    'MyApplications',
    async () => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const today = getSeoulIsoDate(new Date())
      const myApplications = [...applicantApplications].flatMap(
        ([id, application]): MyApplicationResponse[] => {
          const posting = createPostingSample(application.postingId, today)
          if (!posting) {
            return []
          }

          const position = posting.positions.find(({ id: positionId }) => {
            return positionId === application.positionId
          })
          const { postingStatus, docResult, finalResult } = getApplicationProgress(id)

          return [
            {
              id,
              status: application.submittedAt ? 'SUBMITTED' : 'DRAFT',
              submittedAt: application.submittedAt,
              docResult,
              finalResult,
              position: position ? { id: position.id, name: position.name } : null,
              posting: {
                id: posting.id,
                title: posting.title,
                status: postingStatus,
                hasInterview: posting.hasInterview,
                docResultAt: posting.docResultAt,
                finalResultAt: posting.finalResultAt,
                organization: { name: posting.organization.name },
              },
            },
          ]
        },
      )

      return HttpResponse.json({ data: { myApplications } })
    },
  ),
  graphqlApi.query<SubmittedApplicationQuery, SubmittedApplicationQueryVariables>(
    'SubmittedApplication',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const id = String(variables.id)
      const application = applicantApplications.get(id)
      const posting = application && createApplicationFormSample(application.postingId)

      if (!application || !posting) {
        return HttpResponse.json(APPLICATION_NOT_FOUND_RESPONSE)
      }

      const position = posting.positions.find(({ id: positionId }) => {
        return positionId === application.positionId
      })

      return HttpResponse.json({
        data: {
          application: {
            id,
            submittedAt: application.submittedAt,
            availableTimes: application.availableTimes,
            position: position ? { id: position.id, name: position.name } : null,
            posting: {
              id: posting.id,
              title: posting.title,
              questions: posting.questions.map(({ options, ...question }) => ({
                ...question,
                options: options ? { activityFields: options.activityFields } : null,
              })),
            },
            // 저장소에는 답변·첨부 id가 없어 문항 id로 생성
            answers: application.answers.map(({ question, content, attachments }) => ({
              id: `${id}-${question.id}`,
              question,
              content,
              attachments: attachments.map((attachment, index) => ({
                ...attachment,
                id: `${id}-${question.id}-${index}`,
                fileName: null,
              })),
            })),
          },
        },
      })
    },
  ),
]

export { submittedApplicationHandlers }
