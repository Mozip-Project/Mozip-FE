import type {
  DocEvaluationApplicationsQueryVariables,
  DocEvaluationSummaryQueryVariables,
  PostingApplicationsQueryVariables,
} from '@/gql/graphql'

const applicantManagementKeys = {
  all: (postingId: string) => ['applicantManagement', postingId] as const,
  posting: (postingId: string) => [...applicantManagementKeys.all(postingId), 'posting'] as const,
  list: (variables: PostingApplicationsQueryVariables) =>
    [...applicantManagementKeys.all(String(variables.postingId)), 'list', variables] as const,
}

const documentReviewKeys = {
  all: (postingId: string) => ['documentReview', postingId] as const,
  posting: (postingId: string) => [...documentReviewKeys.all(postingId), 'posting'] as const,
  list: (variables: DocEvaluationApplicationsQueryVariables) =>
    [...documentReviewKeys.all(String(variables.postingId)), 'list', variables] as const,
}

const documentResultKeys = {
  all: (postingId: string) => ['documentResult', postingId] as const,
  posting: (postingId: string) => [...documentResultKeys.all(postingId), 'posting'] as const,
  lists: (postingId: string) => [...documentResultKeys.all(postingId), 'list'] as const,
  list: (variables: DocEvaluationSummaryQueryVariables) =>
    [...documentResultKeys.lists(String(variables.postingId)), variables] as const,
}

export { applicantManagementKeys, documentResultKeys, documentReviewKeys }
