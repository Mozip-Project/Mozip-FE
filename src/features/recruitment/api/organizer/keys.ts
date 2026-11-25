import type {
  DocEvaluationApplicationsQueryVariables,
  DocEvaluationSummaryQueryVariables,
  PostingApplicationsQueryVariables,
} from '@/gql/graphql'

// 모집 관리 화면들이 같은 공고를 다뤄 공고 ID 아래로 묶음
const recruitmentKeys = {
  all: (postingId: string) => ['recruitment', postingId] as const,
  posting: (postingId: string) => [...recruitmentKeys.all(postingId), 'posting'] as const,

  // 지원자 관리
  applications: (postingId: string) => [...recruitmentKeys.all(postingId), 'applications'] as const,
  applicationList: (variables: PostingApplicationsQueryVariables) =>
    [...recruitmentKeys.applications(String(variables.postingId)), variables] as const,

  // 서류 평가
  docEvaluations: (postingId: string) =>
    [...recruitmentKeys.all(postingId), 'docEvaluations'] as const,
  docEvaluationList: (variables: DocEvaluationApplicationsQueryVariables) =>
    [...recruitmentKeys.docEvaluations(String(variables.postingId)), variables] as const,

  // 서류 평가 취합
  docSummaries: (postingId: string) => [...recruitmentKeys.all(postingId), 'docSummary'] as const,
  docSummaryList: (variables: DocEvaluationSummaryQueryVariables) =>
    [...recruitmentKeys.docSummaries(String(variables.postingId)), variables] as const,
}

export { recruitmentKeys }
