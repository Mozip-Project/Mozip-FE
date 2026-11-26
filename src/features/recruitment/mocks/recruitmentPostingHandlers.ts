import { delay, HttpResponse } from 'msw'
import { getManagedPostingSample } from '@/features/posting/mocks/managedPostingHandlers'
import { findOrganizationPostingSample } from '@/features/posting/mocks/organizationPostingSamples'
import type { RecruitmentPostingQuery, RecruitmentPostingQueryVariables } from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { MOCK_RESPONSE_DELAY_MS } from '@/mocks/responseDelay'

// 지원자 관리·서류 평가·서류 평가 취합·LNB가 같이 쓰는 공고 정보, 상태는 운영진 홈 공고 상태를 따름
const recruitmentPostingHandlers = [
  graphqlApi.query<RecruitmentPostingQuery, RecruitmentPostingQueryVariables>(
    'RecruitmentPosting',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const postingId = String(variables.id)
      const posting = getManagedPostingSample(postingId)
      const sample = findOrganizationPostingSample(postingId)

      if (!posting || !sample) {
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
            noPosition: sample.noPosition,
            docResultConfirmedAt,
          },
        },
      })
    },
  ),
]

export { recruitmentPostingHandlers }
