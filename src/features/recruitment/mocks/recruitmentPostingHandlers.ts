import { delay, HttpResponse } from 'msw'
import { toServerErrorBody } from '@/features/posting/mocks/demoServerPostings'
import { getManagedPostingSample } from '@/features/posting/mocks/managedPostingHandlers'
import { findOrganizationPostingSample } from '@/features/posting/mocks/organizationPostingSamples'
import { isServerPosting } from '@/features/posting/utils/demoServerPosting'
import {
  RecruitmentPostingDocument,
  type RecruitmentPostingQuery,
  type RecruitmentPostingQueryVariables,
} from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { MOCK_RESPONSE_DELAY_MS } from '@/mocks/responseDelay'
import { requestServerGraphQL } from '@/mocks/serverGraphql'

// 지원자 관리·서류 평가·서류 평가 취합·LNB가 같이 쓰는 공고 정보, 상태는 운영진 홈 공고 상태를 따름
const recruitmentPostingHandlers = [
  graphqlApi.query<RecruitmentPostingQuery, RecruitmentPostingQueryVariables>(
    'RecruitmentPosting',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const postingId = String(variables.id)
      // 시연 모드의 실서버 공고는 LNB 등에 실서버 값 표시 (전시회 후 삭제)
      if (isServerPosting(postingId)) {
        try {
          return HttpResponse.json({
            data: await requestServerGraphQL(RecruitmentPostingDocument, { id: postingId }),
          })
        } catch (error) {
          return HttpResponse.json(toServerErrorBody(error))
        }
      }

      const posting = getManagedPostingSample(postingId)
      const sample = findOrganizationPostingSample(postingId)

      if (!posting) {
        return HttpResponse.json({
          errors: [{ message: '공고를 찾을 수 없습니다.', extensions: { code: 'POSTING_404' } }],
          data: null,
        })
      }

      const { id, title, status, recruitEndAt, docResultAt, hasInterview, docResultConfirmedAt } =
        posting
      return HttpResponse.json({
        data: {
          posting: {
            id,
            title,
            status,
            recruitEndAt,
            docResultAt,
            hasInterview,
            // 공고 작성 MSW로 새로 만든 공고는 샘플이 없어 포지션 있음으로 응답
            noPosition: sample?.noPosition ?? false,
            docResultConfirmedAt,
            // 평가 패널 점수 문항 확인용으로 모든 샘플 공고가 문항별 점수 사용
            docScorePerQuestion: true,
          },
        },
      })
    },
  ),
]

export { recruitmentPostingHandlers }
