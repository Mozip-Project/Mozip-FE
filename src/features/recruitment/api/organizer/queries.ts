import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import type {
  DocEvaluationApplicationsQueryVariables,
  DocEvaluationSummaryQueryVariables,
  DocResult,
  PostingApplicationsQueryVariables,
} from '@/gql/graphql'
import {
  confirmDocResult,
  getDocEvaluationApplications,
  getDocEvaluationSummary,
  getPostingApplications,
  getRecruitmentPosting,
  setDocResult,
} from './api'
import { recruitmentKeys } from './keys'

// 모집 관리 화면과 LNB가 같은 캐시 사용
function useRecruitmentPostingQuery(postingId: string) {
  return useQuery({
    queryKey: recruitmentKeys.posting(postingId),
    queryFn: () => getRecruitmentPosting(postingId),
  })
}

function usePostingApplicationsQuery(variables: PostingApplicationsQueryVariables) {
  const postingId = String(variables.postingId)

  return useQuery({
    queryKey: recruitmentKeys.applicationList(variables),
    queryFn: () => getPostingApplications(variables),
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === postingId ? previousData : undefined,
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
    queryKey: recruitmentKeys.docEvaluationList(variables),
    queryFn: () => getDocEvaluationApplications(variables),
    enabled,
    placeholderData: (previousData, previousQuery) =>
      shouldKeepPreviousData && previousQuery?.queryKey[1] === postingId ? previousData : undefined,
  })
}

// 조건 변경 중에는 같은 공고의 이전 목록 유지
function useDocEvaluationSummaryQuery(variables: DocEvaluationSummaryQueryVariables) {
  const postingId = String(variables.postingId)

  return useQuery({
    queryKey: recruitmentKeys.docSummaryList(variables),
    queryFn: () => getDocEvaluationSummary(variables),
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === postingId ? previousData : undefined,
  })
}

// 안 보는 탭 캐시는 바뀌기 전 집계가 남아 있어 삭제
function refreshDocResultLists(queryClient: QueryClient, postingId: string) {
  const listsKey = recruitmentKeys.docSummaries(postingId)
  queryClient.removeQueries({ queryKey: listsKey, type: 'inactive' })
  return queryClient.invalidateQueries({ queryKey: listsKey })
}

// 명세상 한 요청에 결과 하나라 결과 값별로 묶어 저장
// 일부가 실패해도 전부 끝난 뒤 재조회하도록 모든 요청 완료 대기
function useSetDocResultsMutation(postingId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (changes: ReadonlyMap<string, DocResult>) => {
      const idsByResult = new Map<DocResult, string[]>()
      changes.forEach((result, applicationId) => {
        idsByResult.set(result, [...(idsByResult.get(result) ?? []), applicationId])
      })

      const outcomes = await Promise.allSettled(
        [...idsByResult].map(([result, applicationIds]) =>
          setDocResult({ applicationIds, result }),
        ),
      )
      const failed = outcomes.find(
        (outcome): outcome is PromiseRejectedResult => outcome.status === 'rejected',
      )
      if (failed) {
        throw failed.reason
      }
    },
    onSettled: () =>
      Promise.all([
        refreshDocResultLists(queryClient, postingId),
        queryClient.invalidateQueries({ queryKey: recruitmentKeys.applications(postingId) }),
      ]),
  })
}

// 재조회까지 기다려 팝업이 닫힐 때 확정 후 화면 표시
function useConfirmDocResultMutation(postingId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => confirmDocResult(postingId),
    onSettled: () => {
      queryClient.removeQueries({
        queryKey: recruitmentKeys.docSummaries(postingId),
        type: 'inactive',
      })
      return queryClient.invalidateQueries({ queryKey: recruitmentKeys.all(postingId) })
    },
  })
}

export {
  useConfirmDocResultMutation,
  useDocEvaluationApplicationsQuery,
  useDocEvaluationSummaryQuery,
  usePostingApplicationsQuery,
  useRecruitmentPostingQuery,
  useSetDocResultsMutation,
}
