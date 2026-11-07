import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  confirmDocumentResults,
  getDocumentResultApplicants,
  getDocumentResultOverview,
  updateDocumentResult,
} from '@/features/recruitment/api/organizer'
import type { DocumentResultApplicantPage, DocumentResultQuery } from '@/features/recruitment/types'
import {
  applyDocumentResultChange,
  type DocumentResultChange,
} from '@/features/recruitment/utils/documentResult'
import { useIsHydrated } from '@/hooks/useIsHydrated'

const documentResultKeys = {
  all: (recruitmentId: string) => ['documentResults', recruitmentId] as const,
  list: (recruitmentId: string, query: DocumentResultQuery) =>
    [...documentResultKeys.all(recruitmentId), query] as const,
  overview: (recruitmentId: string) =>
    [...documentResultKeys.all(recruitmentId), 'overview'] as const,
}

// 조건 변경 중에는 이전 목록 유지
function useDocumentResultsQuery(recruitmentId: string, query: DocumentResultQuery) {
  return useQuery({
    queryKey: documentResultKeys.list(recruitmentId, query),
    queryFn: () => getDocumentResultApplicants(recruitmentId, query),
    placeholderData: keepPreviousData,
  })
}

function useUpdateDocumentResultMutation(recruitmentId: string, query: DocumentResultQuery) {
  const queryClient = useQueryClient()
  const queryKey = documentResultKeys.list(recruitmentId, query)

  return useMutation({
    mutationFn: ({ applicantId, result }: DocumentResultChange) =>
      updateDocumentResult(recruitmentId, applicantId, result),
    // 탭 숫자·하단 바를 응답 전에 재계산
    onMutate: async (change) => {
      await queryClient.cancelQueries({ queryKey: documentResultKeys.all(recruitmentId) })
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
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: documentResultKeys.all(recruitmentId) }),
  })
}

// 경계마다 hydration 시점이 달라 먼저 찬 캐시로 서버 HTML과 어긋나지 않도록 hydration 중 데이터 숨김
function useDocumentResultOverview(recruitmentId: string) {
  const isHydrated = useIsHydrated()
  const { data } = useQuery({
    queryKey: documentResultKeys.overview(recruitmentId),
    queryFn: () => getDocumentResultOverview(recruitmentId),
  })

  return isHydrated ? data : undefined
}

function useConfirmDocumentResultsMutation(recruitmentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => confirmDocumentResults(recruitmentId),
    // 재조회까지 기다려 팝업이 닫힐 때 확정 후 화면 표시
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: documentResultKeys.all(recruitmentId) }),
  })
}

export {
  useConfirmDocumentResultsMutation,
  useDocumentResultOverview,
  useDocumentResultsQuery,
  useUpdateDocumentResultMutation,
}
