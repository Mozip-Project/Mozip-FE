import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import type {
  DocEvaluationApplicationsQueryVariables,
  DocEvaluationSummaryQueryVariables,
  DocResult,
  PostingApplicationsQueryVariables,
} from '@/gql/graphql'
import { ApiError } from '@/lib/apiError'
import {
  confirmDocResult,
  getDocEvaluationApplicationChips,
  getDocEvaluationApplicationDetail,
  getDocEvaluationApplications,
  getDocEvaluationSummary,
  getMyDocEvaluation,
  getPostingApplications,
  getPostingQuestions,
  getRecruitmentPosting,
  saveDocEvaluation,
  setDocResult,
} from './api'
import { recruitmentKeys } from './keys'

const DOC_RESULT_CONFIRMED_CODE = 'EVALUATION_423'

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

// 명세상 화면 진입 때 한 번만 받고 지원자 전환에는 다시 받지 않음
function useDocEvaluationApplicationChipsQuery(postingId: string) {
  return useQuery({
    queryKey: recruitmentKeys.docEvaluationChips(postingId),
    queryFn: () => getDocEvaluationApplicationChips(postingId),
    staleTime: Infinity,
  })
}

function useDocEvaluationApplicationDetailQuery(postingId: string, applicationId: string) {
  return useQuery({
    queryKey: recruitmentKeys.docEvaluationApplication(postingId, applicationId),
    queryFn: () => getDocEvaluationApplicationDetail(applicationId),
  })
}

// 공고 문항은 지원자마다 같아 화면 진입 때 한 번만 받음
function usePostingQuestionsQuery(postingId: string) {
  return useQuery({
    queryKey: recruitmentKeys.postingQuestions(postingId),
    queryFn: () => getPostingQuestions(postingId),
    staleTime: Infinity,
  })
}

function useMyDocEvaluationQuery(postingId: string, applicationId: string) {
  return useQuery({
    queryKey: recruitmentKeys.myDocEvaluation(postingId, applicationId),
    queryFn: () => getMyDocEvaluation(applicationId),
  })
}

type DocEvaluationChips = Awaited<ReturnType<typeof getDocEvaluationApplicationChips>>

function useSaveDocEvaluationMutation(postingId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: saveDocEvaluation,
    // 자동, 이탈, 저장 버튼 저장을 보낸 순서대로 처리해 늦게 도착한 이전 저장이 최신 평가를 덮지 않도록 처리
    scope: { id: `doc-evaluation-${postingId}` },
    onSuccess: async ({ evaluation }, { input, submit }) => {
      const applicationId = String(input.applicationId)
      // 저장 전에 시작한 조회가 늦게 끝나 저장 결과를 덮지 않도록 취소
      await Promise.all([
        queryClient.cancelQueries({
          queryKey: recruitmentKeys.myDocEvaluation(postingId, applicationId),
        }),
        queryClient.cancelQueries({ queryKey: recruitmentKeys.docEvaluationChips(postingId) }),
      ])
      queryClient.setQueryData(
        recruitmentKeys.myDocEvaluation(postingId, applicationId),
        evaluation,
      )
      queryClient.setQueryData<DocEvaluationChips>(
        recruitmentKeys.docEvaluationChips(postingId),
        (chips) =>
          chips?.map((chip) =>
            chip.application.id === applicationId
              ? { ...chip, myEvaluationStatus: evaluation.status }
              : chip,
          ),
      )

      if (submit) {
        void queryClient.invalidateQueries({ queryKey: recruitmentKeys.docEvaluations(postingId) })
        void queryClient.invalidateQueries({ queryKey: recruitmentKeys.docSummaries(postingId) })
      }
    },
    // 다른 운영진이 결과를 확정했으면 공고를 다시 받아 읽기 전용으로 전환
    onError: (error) => {
      if (error instanceof ApiError && error.code === DOC_RESULT_CONFIRMED_CODE) {
        void queryClient.invalidateQueries({ queryKey: recruitmentKeys.posting(postingId) })
      }
    },
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
  useDocEvaluationApplicationChipsQuery,
  useDocEvaluationApplicationDetailQuery,
  useDocEvaluationApplicationsQuery,
  useDocEvaluationSummaryQuery,
  useMyDocEvaluationQuery,
  usePostingApplicationsQuery,
  usePostingQuestionsQuery,
  useRecruitmentPostingQuery,
  useSaveDocEvaluationMutation,
  useSetDocResultsMutation,
}
