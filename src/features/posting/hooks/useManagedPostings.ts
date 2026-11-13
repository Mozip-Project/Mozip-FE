import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteManagedPosting,
  getManagedPostings,
  getUpRemainingCount,
  upManagedPosting,
} from '@/features/posting/api/organizer'
import type { ManagedPosting } from '@/features/posting/types'

const managedPostingKeys = {
  all: ['managedPostings'] as const,
  list: ['managedPostings', 'list'] as const,
  // 단체 단위 잔여 횟수라 모든 공고 카드가 같은 캐시 사용
  upRemainingCount: ['managedPostings', 'upRemainingCount'] as const,
}

function useManagedPostingsQuery() {
  return useQuery({ queryKey: managedPostingKeys.list, queryFn: getManagedPostings })
}

// 목록에서 먼저 빼고 실패하면 되돌림
function useDeleteManagedPostingMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteManagedPosting,
    onMutate: async (postingId) => {
      await queryClient.cancelQueries({ queryKey: managedPostingKeys.list })
      const previousPostings = queryClient.getQueryData<ManagedPosting[]>(managedPostingKeys.list)

      queryClient.setQueryData<ManagedPosting[]>(managedPostingKeys.list, (postings) =>
        postings?.filter((posting) => posting.id !== postingId),
      )

      return { previousPostings }
    },
    onError: (_error, _postingId, context) => {
      if (context?.previousPostings) {
        queryClient.setQueryData(managedPostingKeys.list, context.previousPostings)
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: managedPostingKeys.list }),
  })
}

function useUpRemainingCount() {
  const { data } = useQuery({
    queryKey: managedPostingKeys.upRemainingCount,
    queryFn: getUpRemainingCount,
  })

  return data
}

function useUpPostingMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: upManagedPosting,
    // 순위·잔여 횟수 재조회까지 기다려 팝업이 닫힐 때 바뀐 값 표시
    onSuccess: () => queryClient.invalidateQueries({ queryKey: managedPostingKeys.all }),
  })
}

export {
  useDeleteManagedPostingMutation,
  useManagedPostingsQuery,
  useUpPostingMutation,
  useUpRemainingCount,
}
