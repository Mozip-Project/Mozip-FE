import { HttpResponse } from 'msw'
import type { ReportPostingMutation, ReportPostingMutationVariables } from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'

// 같은 공고 재신고 확인용, 서버를 다시 시작하면 초기화
let reportedPostingIds = new Set<string>()

function resetReportedPostings() {
  reportedPostingIds = new Set()
}

const postingReportHandlers = [
  graphqlApi.mutation<ReportPostingMutation, ReportPostingMutationVariables>(
    'ReportPosting',
    ({ variables }) => {
      // ID 입력은 string | number로 생성되어 문자열로 통일
      const postingId = String(variables.postingId)

      if (reportedPostingIds.has(postingId)) {
        return HttpResponse.json({
          errors: [{ message: '이미 신고한 공고입니다.', extensions: { code: 'REPORT_409' } }],
          data: null,
        })
      }

      reportedPostingIds.add(postingId)
      return HttpResponse.json({ data: { reportPosting: true } })
    },
  ),
]

export { postingReportHandlers, resetReportedPostings }
