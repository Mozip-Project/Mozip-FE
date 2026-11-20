import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getApplicantManagementApplicants } from '@/features/recruitment/api/organizer'
import type { ApplicantManagementQuery } from '@/features/recruitment/types'

const applicantManagementKeys = {
  all: (postingId: string) => ['applicantManagement', postingId] as const,
  list: (postingId: string, query: ApplicantManagementQuery) =>
    [...applicantManagementKeys.all(postingId), query] as const,
}

// 조건 변경 중에는 이전 목록 유지
function useApplicantManagementQuery(postingId: string, query: ApplicantManagementQuery) {
  return useQuery({
    queryKey: applicantManagementKeys.list(postingId, query),
    queryFn: () => getApplicantManagementApplicants(postingId, query),
    placeholderData: keepPreviousData,
  })
}

export { applicantManagementKeys, useApplicantManagementQuery }
