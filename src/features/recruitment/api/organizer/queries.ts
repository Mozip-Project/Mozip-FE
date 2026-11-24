import { useQuery } from '@tanstack/react-query'
import type {
  DocEvaluationApplicationsQueryVariables,
  PostingApplicationsQueryVariables,
} from '@/gql/graphql'
import {
  getApplicantManagementPosting,
  getDocEvaluationApplications,
  getDocumentReviewPosting,
  getPostingApplications,
} from './api'
import { applicantManagementKeys, documentReviewKeys } from './keys'

function useApplicantManagementPostingQuery(postingId: string) {
  return useQuery({
    queryKey: applicantManagementKeys.posting(postingId),
    queryFn: () => getApplicantManagementPosting(postingId),
  })
}

function usePostingApplicationsQuery(variables: PostingApplicationsQueryVariables) {
  const postingId = String(variables.postingId)

  return useQuery({
    queryKey: applicantManagementKeys.list(variables),
    queryFn: () => getPostingApplications(variables),
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === postingId ? previousData : undefined,
  })
}

function useDocumentReviewPostingQuery(postingId: string) {
  return useQuery({
    queryKey: documentReviewKeys.posting(postingId),
    queryFn: () => getDocumentReviewPosting(postingId),
  })
}

type DocEvaluationApplicationsQueryOptions = {
  enabled?: boolean
  // 조건 변경 중 이전 공고의 목록은 남기지 않음
  shouldKeepPreviousData?: boolean
}

function useDocEvaluationApplicationsQuery(
  variables: DocEvaluationApplicationsQueryVariables,
  { enabled = true, shouldKeepPreviousData = false }: DocEvaluationApplicationsQueryOptions = {},
) {
  const postingId = String(variables.postingId)

  return useQuery({
    queryKey: documentReviewKeys.list(variables),
    queryFn: () => getDocEvaluationApplications(variables),
    enabled,
    placeholderData: (previousData, previousQuery) =>
      shouldKeepPreviousData && previousQuery?.queryKey[1] === postingId ? previousData : undefined,
  })
}

export {
  useApplicantManagementPostingQuery,
  useDocEvaluationApplicationsQuery,
  useDocumentReviewPostingQuery,
  usePostingApplicationsQuery,
}
