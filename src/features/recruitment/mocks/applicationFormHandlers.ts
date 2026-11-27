import { delay, HttpResponse } from 'msw'
import { createPostingSample } from '@/features/posting/mocks/postingDetailHandlers'
import { getMockAccount } from '@/features/user/mocks/userHandlers'
import type {
  AnswerInput,
  ApplicantProfileQuery,
  ApplicantProfileQueryVariables,
  PostingApplicationFormQuery,
  PostingApplicationFormQueryVariables,
  PostingMyApplicationsQuery,
  PostingMyApplicationsQueryVariables,
  SaveApplicationDraftMutation,
  SaveApplicationDraftMutationVariables,
  SubmitApplicationMutation,
  SubmitApplicationMutationVariables,
} from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { MOCK_RESPONSE_DELAY_MS } from '@/mocks/responseDelay'
import { getSeoulIsoDate } from '@/utils/date'
import {
  applicantApplications,
  createApplicationFormSample,
  toApplicationId,
} from './applicantApplicationStore'

const ALREADY_SUBMITTED_RESPONSE = {
  errors: [{ message: '이미 제출한 지원서입니다.', extensions: { code: 'APPLICATION_409' } }],
  data: null,
}

type MyApplicationResponse = PostingMyApplicationsQuery['posting']['myApplications'][number]

// 링크만 보관, 파일은 업로드 API가 없어 저장 입력에 없음
function toAnswerResponses(answers: readonly AnswerInput[]): MyApplicationResponse['answers'] {
  return answers.map(({ questionId, content, attachments }) => ({
    question: { id: String(questionId) },
    content: content ?? null,
    attachments: (attachments ?? []).flatMap(({ url }) =>
      url ? [{ type: 'LINK' as const, url }] : [],
    ),
  }))
}

function isRecruiting(recruitStartAt: string | null, recruitEndAt: string | null) {
  const now = Date.now()
  return (
    recruitStartAt !== null &&
    recruitEndAt !== null &&
    new Date(recruitStartAt).getTime() <= now &&
    now <= new Date(recruitEndAt).getTime()
  )
}

const applicationFormHandlers = [
  graphqlApi.query<PostingApplicationFormQuery, PostingApplicationFormQueryVariables>(
    'PostingApplicationForm',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      // ID 입력은 string | number로 생성되어 문자열로 통일
      const posting = createApplicationFormSample(String(variables.id))

      if (!posting) {
        return HttpResponse.json({
          errors: [{ message: '공고를 찾을 수 없습니다.', extensions: { code: 'POSTING_404' } }],
          data: null,
        })
      }
      return HttpResponse.json({ data: { posting } })
    },
  ),
  // 마이페이지 계정 MSW와 같은 회원, 프로필 사진은 없음
  graphqlApi.query<ApplicantProfileQuery, ApplicantProfileQueryVariables>(
    'ApplicantProfile',
    async () => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const { id, name, phone, school, schoolVerification } = getMockAccount()

      return HttpResponse.json({
        data: { me: { id, name, phone, profileImageUrl: null, school, schoolVerification } },
      })
    },
  ),
  graphqlApi.query<PostingMyApplicationsQuery, PostingMyApplicationsQueryVariables>(
    'PostingMyApplications',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const postingId = String(variables.id)
      const myApplications = [...applicantApplications]
        .filter(([, application]) => application.postingId === postingId)
        .map(([id, { postingId: _postingId, positionId, ...application }]) => ({
          ...application,
          id,
          position: positionId ? { id: positionId } : null,
        }))

      return HttpResponse.json({ data: { posting: { id: postingId, myApplications } } })
    },
  ),
  graphqlApi.mutation<SaveApplicationDraftMutation, SaveApplicationDraftMutationVariables>(
    'SaveApplicationDraft',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const postingId = String(variables.postingId)
      const posting = createPostingSample(postingId, getSeoulIsoDate(new Date()))

      if (!posting) {
        return HttpResponse.json({
          errors: [{ message: '공고를 찾을 수 없습니다.', extensions: { code: 'POSTING_404' } }],
          data: null,
        })
      }
      // 모집 예정·마감 목데이터로 저장 실패 확인
      if (!isRecruiting(posting.recruitStartAt, posting.recruitEndAt)) {
        return HttpResponse.json({
          errors: [{ message: '모집 기간이 아닙니다.', extensions: { code: 'POSTING_409' } }],
          data: null,
        })
      }
      const positionId = variables.input.positionId ? String(variables.input.positionId) : null
      const id = toApplicationId(postingId, positionId)

      if (applicantApplications.get(id)?.submittedAt) {
        return HttpResponse.json(ALREADY_SUBMITTED_RESPONSE)
      }
      const updatedAt = new Date().toISOString()
      const { answers, availableTimes } = variables.input

      applicantApplications.set(id, {
        postingId,
        positionId,
        submittedAt: null,
        updatedAt,
        answers: toAnswerResponses(answers),
        availableTimes: availableTimes ?? [],
      })
      return HttpResponse.json({ data: { saveApplicationDraft: { id, updatedAt } } })
    },
  ),
  // 필수 문항 검증은 화면에서 막아 생략
  graphqlApi.mutation<SubmitApplicationMutation, SubmitApplicationMutationVariables>(
    'SubmitApplication',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const id = String(variables.id)
      const application = applicantApplications.get(id)

      if (!application) {
        return HttpResponse.json({
          errors: [
            { message: '지원서를 찾을 수 없습니다.', extensions: { code: 'APPLICATION_404' } },
          ],
          data: null,
        })
      }
      if (application.submittedAt) {
        return HttpResponse.json(ALREADY_SUBMITTED_RESPONSE)
      }
      applicantApplications.set(id, { ...application, submittedAt: new Date().toISOString() })
      return HttpResponse.json({ data: { submitApplication: { id } } })
    },
  ),
]

export { applicationFormHandlers }
