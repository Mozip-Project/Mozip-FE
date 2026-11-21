import {
  keepPreviousData,
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { UpdateOrganizationInput } from '@/gql/graphql'
import {
  getKeywordSuggestions,
  getOrganization,
  getOrganizationMembers,
  updateOrganization,
} from './api'
import { organizationKeys } from './keys'

// 현재 단체를 아직 모르면(null) 요청 보류
function useOrganizationMembersQuery(organizationId: string | null) {
  return useQuery({
    queryKey: organizationKeys.members(organizationId ?? ''),
    queryFn: organizationId ? () => getOrganizationMembers(organizationId) : skipToken,
  })
}

function useOrganizationQuery(organizationId: string | null) {
  return useQuery({
    queryKey: organizationKeys.detail(organizationId ?? ''),
    queryFn: organizationId ? () => getOrganization(organizationId) : skipToken,
  })
}

// 저장 응답이 조회와 같은 필드라 다시 요청하지 않고 캐시에 바로 반영
function useUpdateOrganizationMutation(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateOrganizationInput) => updateOrganization(organizationId, input),
    onSuccess: (organization) => {
      queryClient.setQueryData(organizationKeys.detail(organizationId), organization)
    },
  })
}

// 빈 검색어는 요청 보류, 입력 중 목록이 깜박이지 않도록 이전 결과 유지
function useKeywordSuggestionsQuery(query: string) {
  const trimmedQuery = query.trim()

  return useQuery({
    queryKey: organizationKeys.keywordSuggestions(trimmedQuery),
    queryFn: trimmedQuery ? () => getKeywordSuggestions(trimmedQuery) : skipToken,
    placeholderData: keepPreviousData,
  })
}

export {
  useKeywordSuggestionsQuery,
  useOrganizationMembersQuery,
  useOrganizationQuery,
  useUpdateOrganizationMutation,
}
