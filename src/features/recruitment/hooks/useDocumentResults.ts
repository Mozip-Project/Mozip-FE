import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  confirmDocumentResults,
  getDocumentResultApplicants,
  getDocumentResultOverview,
  updateDocumentResult,
} from '@/features/recruitment/api/organizer'
import { applicantManagementKeys } from '@/features/recruitment/api/organizer/keys'
import type { DocumentResultApplicantPage, DocumentResultQuery } from '@/features/recruitment/types'
import {
  applyDocumentResultChange,
  type DocumentResultChange,
} from '@/features/recruitment/utils/documentResult'
import { useIsHydrated } from '@/hooks/useIsHydrated'

const documentResultKeys = {
  all: (postingId: string) => ['documentResults', postingId] as const,
  list: (postingId: string, query: DocumentResultQuery) =>
    [...documentResultKeys.all(postingId), query] as const,
  overview: (postingId: string) => [...documentResultKeys.all(postingId), 'overview'] as const,
}

// 조건 변경 중에는 이전 목록 유지
function useDocumentResultsQuery(postingId: string, query: DocumentResultQuery) {
  return useQuery({
    queryKey: documentResultKeys.list(postingId, query),
    queryFn: () => getDocumentResultApplicants(postingId, query),
    placeholderData: keepPreviousData,
  })
}

function useUpdateDocumentResultMutation(postingId: string, query: DocumentResultQuery) {
  const queryClient = useQueryClient()
  const queryKey = documentResultKeys.list(postingId, query)

  return useMutation({
    mutationFn: ({ applicantId, result }: DocumentResultChange) =>
      updateDocumentResult(postingId, applicantId, result),
    // 탭 숫자·하단 바를 응답 전에 재계산
    onMutate: async (change) => {
      await queryClient.cancelQueries({ queryKey: documentResultKeys.all(postingId) })
      const previousPage = queryClient.getQueryData<DocumentResultApplicantPage>(queryKey)

      if (previousPage) {
        queryClient.setQueryData(queryKey, applyDocumentResultChange(previousPage, change))
      }

      return { previousPage }
    },
    onError: (_error, _change, context) => {
      if (context?.previousPage) {
        queryClient.setQueryData(queryKey, context.previousPage)
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: documentResultKeys.all(postingId) }),
  })
}

// 경계마다 hydration 시점이 달라 먼저 찬 캐시로 서버 HTML과 어긋나지 않도록 hydration 중 데이터 숨김
function useDocumentResultOverview(postingId: string) {
  const isHydrated = useIsHydrated()
  const { data } = useQuery({
    queryKey: documentResultKeys.overview(postingId),
    queryFn: () => getDocumentResultOverview(postingId),
  })

  return isHydrated ? data : undefined
}

function useConfirmDocumentResultsMutation(postingId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => confirmDocumentResults(postingId),
    // 재조회까지 기다려 팝업이 닫힐 때 확정 후 화면 표시, 지원자 관리 결과도 확정 기준으로 갱신
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: documentResultKeys.all(postingId) }),
        queryClient.invalidateQueries({ queryKey: applicantManagementKeys.all(postingId) }),
      ]),
  })
}

export {
  useConfirmDocumentResultsMutation,
  useDocumentResultOverview,
  useDocumentResultsQuery,
  useUpdateDocumentResultMutation,
}
