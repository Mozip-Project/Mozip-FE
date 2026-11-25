import type {
  DocEvaluationApplicationsQueryVariables,
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

export { applicantManagementKeys, documentReviewKeys }
