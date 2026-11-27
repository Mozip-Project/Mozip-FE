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

  // 서류 평가하기 칩, 저장 뒤 목록 재조회에 섞이지 않게 서류 평가 목록과 분리
  docEvaluationChips: (postingId: string) =>
    [...recruitmentKeys.all(postingId), 'docEvaluationChips'] as const,
  postingQuestions: (postingId: string) =>
    [...recruitmentKeys.all(postingId), 'postingQuestions'] as const,
  docEvaluationApplication: (postingId: string, applicationId: string) =>
    [...recruitmentKeys.all(postingId), 'docEvaluationApplication', applicationId] as const,
  myDocEvaluation: (postingId: string, applicationId: string) =>
    [...recruitmentKeys.all(postingId), 'myDocEvaluation', applicationId] as const,

  // 서류 평가 취합
  docSummaries: (postingId: string) => [...recruitmentKeys.all(postingId), 'docSummary'] as const,
  docSummaryList: (variables: DocEvaluationSummaryQueryVariables) =>
    [...recruitmentKeys.docSummaries(String(variables.postingId)), variables] as const,

  resultMessages: (postingId: string) =>
    [...recruitmentKeys.all(postingId), 'resultMessages'] as const,
  // 발송 중 폴링용, 전체 조회와 분리
  resultMessageProgress: (postingId: string) =>
    [...recruitmentKeys.all(postingId), 'resultMessageProgress'] as const,
}

export { recruitmentKeys }
