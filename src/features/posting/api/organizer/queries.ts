import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ManagedPostingFieldsFragment, PostingStatus } from '@/gql/graphql'
import {
  bumpPosting,
  deletePosting,
  getManagedPosting,
  getManagedPostingSummary,
  getOrganizationPostings,
  getPostingDraft,
  publishPosting,
  savePostingDraft,
  sendNotice,
} from './api'
import { managedPostingKeys, postingDraftKeys } from './keys'

// 팝업이 발송 중 닫히지 않도록 진행 여부를 키로 확인
const SEND_NOTICE_MUTATION_KEY = ['sendNotice'] as const

// 발송 결과가 바꾸는 조회 데이터가 없어 갱신 없음
function useSendNoticeMutation() {
  return useMutation({ mutationKey: SEND_NOTICE_MUTATION_KEY, mutationFn: sendNotice })
}

function useManagedPostingQuery(postingId: string) {
  return useQuery({
    queryKey: managedPostingKeys.detail(postingId),
    queryFn: () => getManagedPosting(postingId),
  })
}

// 현재 단체를 아직 모르면(null) 요청 보류
function useOrganizationPostingsQuery(
  organizationId: string | null,
  status: readonly PostingStatus[],
) {
  return useQuery({
    queryKey: managedPostingKeys.list(organizationId ?? '', status),
    queryFn: organizationId ? () => getOrganizationPostings(organizationId, status) : skipToken,
  })
}

function useManagedPostingSummaryQuery(organizationId: string | null) {
  return useQuery({
    queryKey: managedPostingKeys.summary(organizationId ?? ''),
    queryFn: organizationId ? () => getManagedPostingSummary(organizationId) : skipToken,
  })
}

// 목록에서 먼저 빼고 실패하면 되돌림, 끝나면 탭 숫자까지 다시 조회
function useDeletePostingMutation() {
  const queryClient = useQueryClient()
  const listsKey = managedPostingKeys.lists

  return useMutation({
    mutationFn: deletePosting,
    onMutate: async (postingId) => {
      await queryClient.cancelQueries({ queryKey: listsKey })
      const previousLists = queryClient.getQueriesData<ManagedPostingFieldsFragment[]>({
        queryKey: listsKey,
      })

      queryClient.setQueriesData<ManagedPostingFieldsFragment[]>(
        { queryKey: listsKey },
        (postings) => postings?.filter((posting) => posting.id !== postingId),
      )

      return { previousLists }
    },
    onError: (_error, _postingId, context) => {
      context?.previousLists.forEach(([queryKey, postings]) => {
        queryClient.setQueryData(queryKey, postings)
      })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: managedPostingKeys.all }),
  })
}

// 순위·잔여 횟수 재조회까지 기다려 팝업이 닫힐 때 바뀐 값 표시
function useBumpPostingMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bumpPosting,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: managedPostingKeys.all }),
  })
}

function usePostingDraftQuery(postingId: string) {
  return useQuery({
    queryKey: postingDraftKeys.detail(postingId),
    queryFn: () => getPostingDraft(postingId),
  })
}

// 응답이 저장된 공고 전체라 작성 화면 값은 다시 요청하지 않고 바로 교체, 첫 저장이면 작성 중 탭 숫자도 바뀜
function useSavePostingDraftMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: savePostingDraft,
    onSuccess: (posting) => {
      queryClient.setQueryData(postingDraftKeys.detail(posting.id), posting)
      return queryClient.invalidateQueries({ queryKey: managedPostingKeys.all })
    },
  })
}

function usePublishPostingMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: publishPosting,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: managedPostingKeys.all }),
  })
}

export {
  SEND_NOTICE_MUTATION_KEY,
  useBumpPostingMutation,
  usePostingDraftQuery,
  usePublishPostingMutation,
  useSavePostingDraftMutation,
  useDeletePostingMutation,
  useManagedPostingQuery,
  useManagedPostingSummaryQuery,
  useOrganizationPostingsQuery,
  useSendNoticeMutation,
}
