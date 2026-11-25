import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import type {
  DocEvaluationApplicationsQueryVariables,
  DocEvaluationSummaryQueryVariables,
  DocResult,
  PostingApplicationsQueryVariables,
} from '@/gql/graphql'
import {
  confirmDocResult,
  getApplicantManagementPosting,
  getDocEvaluationApplications,
  getDocEvaluationSummary,
  getDocumentResultPosting,
  getDocumentReviewPosting,
  getPostingApplications,
  setDocResult,
} from './api'
import { applicantManagementKeys, documentResultKeys, documentReviewKeys } from './keys'

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

function useDocumentResultPostingQuery(postingId: string) {
  return useQuery({
    queryKey: documentResultKeys.posting(postingId),
    queryFn: () => getDocumentResultPosting(postingId),
  })
}

// 조건 변경 중에는 같은 공고의 이전 목록 유지
function useDocEvaluationSummaryQuery(variables: DocEvaluationSummaryQueryVariables) {
  const postingId = String(variables.postingId)

  return useQuery({
    queryKey: documentResultKeys.list(variables),
    queryFn: () => getDocEvaluationSummary(variables),
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === postingId ? previousData : undefined,
  })
}

// 다른 탭·조건 목록 캐시에는 바뀌기 전 공고 전체 집계(확정 가능 여부·확정 시각)가 남아 있어 삭제
// 다음에 열 때는 보고 있던 최신 목록을 잠깐 보여 주고 새로 조회
function refreshDocResultLists(queryClient: QueryClient, postingId: string) {
  const listsKey = documentResultKeys.lists(postingId)
  queryClient.removeQueries({ queryKey: listsKey, type: 'inactive' })
  return queryClient.invalidateQueries({ queryKey: listsKey })
}

// 모아 둔 변경을 결과 값별로 묶어 저장(명세상 한 요청에 결과 하나), 끝나면 취합 목록·지원자 관리 재조회
// 화면 반영은 호출하는 쪽(useDocumentResults)이 저장 전 값을 덮어씌워 처리
function useSetDocResultsMutation(postingId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (changes: ReadonlyMap<string, DocResult>) => {
      const idsByResult = new Map<DocResult, string[]>()
      changes.forEach((result, applicationId) => {
        idsByResult.set(result, [...(idsByResult.get(result) ?? []), applicationId])
      })

      return Promise.all(
        [...idsByResult].map(([result, applicationIds]) =>
          setDocResult({ applicationIds, result }),
        ),
      )
    },
    onSettled: () =>
      Promise.all([
        refreshDocResultLists(queryClient, postingId),
        queryClient.invalidateQueries({ queryKey: applicantManagementKeys.all(postingId) }),
      ]),
  })
}

// 재조회까지 기다려 팝업이 닫힐 때 확정 후 화면 표시, 실패해도 바뀐 확정 조건 반영
// 지원자 관리 결과와 서류 평가 버튼(평가 보기)도 확정 기준으로 갱신
function useConfirmDocResultMutation(postingId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => confirmDocResult(postingId),
    onSettled: () =>
      Promise.all([
        refreshDocResultLists(queryClient, postingId),
        queryClient.invalidateQueries({ queryKey: documentResultKeys.posting(postingId) }),
        queryClient.invalidateQueries({ queryKey: applicantManagementKeys.all(postingId) }),
        queryClient.invalidateQueries({ queryKey: documentReviewKeys.all(postingId) }),
      ]),
  })
}

export {
  useApplicantManagementPostingQuery,
  useConfirmDocResultMutation,
  useDocEvaluationApplicationsQuery,
  useDocEvaluationSummaryQuery,
  useDocumentResultPostingQuery,
  useDocumentReviewPostingQuery,
  usePostingApplicationsQuery,
  useSetDocResultsMutation,
}
