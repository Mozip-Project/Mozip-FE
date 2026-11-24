import { useQuery } from '@tanstack/react-query'
import type { PostingApplicationsQueryVariables } from '@/gql/graphql'
import { getApplicantManagementPosting, getPostingApplications } from './api'
import { applicantManagementKeys } from './keys'

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

export { useApplicantManagementPostingQuery, usePostingApplicationsQuery }
