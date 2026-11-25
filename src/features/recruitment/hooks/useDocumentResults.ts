import { useEffect, useEffectEvent, useRef, useState } from 'react'
import {
  useDocEvaluationSummaryQuery,
  useRecruitmentPostingQuery,
  useSetDocResultsMutation,
} from '@/features/recruitment/api/organizer/queries'
import type {
  DocumentResult,
  DocumentResultApplicantPage,
  DocumentResultQuery,
  DocumentResultSort,
  DocumentResultStatus,
} from '@/features/recruitment/types'
import { applyDocResultChange } from '@/features/recruitment/utils/documentResult'
import type {
  DocEvaluationSummaryQuery,
  DocEvaluationSummaryQueryVariables,
  DocResult,
  DocResultTab,
  DocSummarySort,
} from '@/gql/graphql'

type DocEvaluationSummaryPage = DocEvaluationSummaryQuery['docEvaluationSummary']

// 연달아 바꾼 결과를 모아 저장하기까지 기다리는 시간
const RESULT_SAVE_DELAY_MS = 500

const DOC_RESULT_TAB = {
  all: 'ALL',
  pass: 'PASS',
  hold: 'HOLD',
  fail: 'FAIL',
} satisfies Record<DocumentResultStatus, DocResultTab>

const DOC_SUMMARY_SORT = {
  rankDesc: 'SCORE_DESC',
  rankAsc: 'SCORE_ASC',
  nameAsc: 'NAME_ASC',
  nameDesc: 'NAME_DESC',
} satisfies Record<DocumentResultSort, DocSummarySort>

const DOC_RESULT = {
  pass: 'PASS',
  hold: 'HOLD',
  fail: 'FAIL',
} satisfies Record<DocumentResult, DocResult>

// 빈 검색어는 생략해 전체 조회
function toDocEvaluationSummaryVariables(
  postingId: string,
  query: DocumentResultQuery,
): DocEvaluationSummaryQueryVariables {
  const keyword = query.keyword.trim()

  return {
    postingId,
    tab: DOC_RESULT_TAB[query.status],
    positionIds: query.positions.length > 0 ? [...query.positions] : null,
    keyword: keyword === '' ? null : keyword,
    sort: DOC_SUMMARY_SORT[query.sort],
    page: query.page,
  }
}

function toDocumentResult(docResult: DocResult): DocumentResult | null {
  switch (docResult) {
    case 'PENDING':
      return null
    case 'PASS':
      return 'pass'
    case 'HOLD':
      return 'hold'
    case 'FAIL':
      return 'fail'
  }
}

function toApplicants({ rows }: DocEvaluationSummaryPage) {
  return rows.map(({ application, rank, averageScore, opinionCounts, evaluationComplete }) => ({
    id: application.id,
    name: application.user.name,
    positionName: application.position?.name ?? null,
    rank,
    opinionCounts: {
      pass: opinionCounts.pass,
      hold: opinionCounts.hold,
      fail: opinionCounts.fail,
      pending: opinionCounts.notEvaluated,
    },
    averageScore,
    result: toDocumentResult(application.docResult),
    isEvaluationComplete: evaluationComplete,
  }))
}

function toPositionOptions({ positionCounts }: DocEvaluationSummaryPage) {
  return positionCounts.map(({ position, count }) => ({
    value: position.id,
    label: position.name,
    count,
  }))
}

function toTotals({ summary }: DocEvaluationSummaryPage) {
  return {
    totalCount: summary.totalCount,
    evaluatedCount: summary.evaluatedCount,
    isAllEvaluated: summary.allEvaluated,
    passCount: summary.passCount,
    holdCount: summary.holdCount,
    failCount: summary.failCount,
    pendingCount: summary.pendingCount,
    canConfirm: summary.canConfirm,
  }
}

type DocEvaluationSummaryRow = DocEvaluationSummaryPage['rows'][number]

type PendingDocResult = {
  // 서버에 저장된 결과
  savedResult: DocResult
  result: DocResult
  // 탭 숫자 반영 여부 판단용
  name: string
  positionId: string | null
}

// 결과 변경은 바로 화면에 반영하고, 마지막 변경 뒤 모아서 저장
// TODO: 결과 변경 실패(EVALUATION_409) 안내 디자인 확인 필요
function useDocResultChanges(postingId: string) {
  const { mutateAsync: saveResults } = useSetDocResultsMutation(postingId)
  // 저장 뒤 재조회까지 화면에 덮어쓸 값
  const [pendingResults, setPendingResults] = useState<ReadonlyMap<string, PendingDocResult>>(
    new Map(),
  )
  // 아직 보내지 않은 값
  const unsentRef = useRef(new Map<string, DocResult>())
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  function save() {
    clearTimeout(timerRef.current)
    const changes = unsentRef.current
    if (changes.size === 0) {
      return
    }
    unsentRef.current = new Map()

    // 저장 중 다시 바꾼 값은 남김
    function settle(isSaved: boolean) {
      setPendingResults((previous) => {
        const next = new Map(previous)
        changes.forEach((sentResult, applicationId) => {
          const pending = next.get(applicationId)
          if (!pending) {
            return
          }
          if (pending.result === sentResult) {
            next.delete(applicationId)
          } else if (isSaved) {
            next.set(applicationId, { ...pending, savedResult: sentResult })
          }
        })
        return next
      })
    }
    saveResults(changes).then(
      () => settle(true),
      () => settle(false),
    )
  }

  // 화면을 떠나도 모아 둔 변경은 바로 저장
  const saveOnLeave = useEffectEvent(save)
  useEffect(() => () => saveOnLeave(), [])

  function changeResult({ application }: DocEvaluationSummaryRow, result: DocumentResult) {
    const docResult = DOC_RESULT[result]
    unsentRef.current.set(application.id, docResult)
    setPendingResults((previous) =>
      new Map(previous).set(application.id, {
        savedResult: previous.get(application.id)?.savedResult ?? application.docResult,
        result: docResult,
        name: application.user.name,
        positionId: application.position?.id ?? null,
      }),
    )
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(save, RESULT_SAVE_DELAY_MS)
  }

  return { pendingResults, changeResult, isSaving: pendingResults.size > 0 }
}

// 탭 숫자는 포지션·검색 조건 기준
function isInListFilter({ name, positionId }: PendingDocResult, query: DocumentResultQuery) {
  const keyword = query.keyword.trim()
  const isPositionMatched =
    query.positions.length === 0 || (positionId !== null && query.positions.includes(positionId))
  return isPositionMatched && name.includes(keyword)
}

// 확정 후에는 보류 탭이 없어 보류 탭 주소는 전체 탭으로 조회
function useDocumentResults(postingId: string, urlQuery: DocumentResultQuery) {
  const postingQuery = useRecruitmentPostingQuery(postingId)
  const posting = postingQuery.data
  const isConfirmed = Boolean(posting?.docResultConfirmedAt)
  const query: DocumentResultQuery =
    isConfirmed && urlQuery.status === 'hold' ? { ...urlQuery, status: 'all' } : urlQuery
  const summaryQuery = useDocEvaluationSummaryQuery(
    toDocEvaluationSummaryVariables(postingId, query),
  )
  const resultChanges = useDocResultChanges(postingId)
  const summary =
    summaryQuery.data &&
    [...resultChanges.pendingResults].reduce(
      (page, [applicationId, pending]) =>
        applyDocResultChange(page, applicationId, {
          from: pending.savedResult,
          to: pending.result,
          isCounted: isInListFilter(pending, query),
        }),
      summaryQuery.data,
    )

  // 바꾼 행의 원래 결과·포지션은 서버 목록에서 찾음
  function changeResult(applicationId: string, result: DocumentResult) {
    const row = summaryQuery.data?.rows.find(({ application }) => application.id === applicationId)
    if (row) {
      resultChanges.changeResult(row, result)
    }
  }

  const data: DocumentResultApplicantPage | undefined =
    posting && summary
      ? {
          applicants: toApplicants(summary),
          statusCounts: summary.tabCounts,
          positionOptions: toPositionOptions(summary),
          currentPage: summary.page,
          totalPages: summary.totalPages,
          hasPositions: !posting.noPosition,
          hasInterview: posting.hasInterview,
          confirmedAt: posting.docResultConfirmedAt ?? null,
          totals: toTotals(summary),
        }
      : undefined

  // 이전 목록이 없는 조회 실패만 실패 화면
  const isError = !data && (postingQuery.isError || summaryQuery.isError)

  return {
    data,
    query,
    isError,
    isPlaceholderData: summaryQuery.isPlaceholderData,
    changeResult,
    // 저장 전·저장 중에는 확정 막기
    isSaving: resultChanges.isSaving,
  }
}

export { useDocumentResults }
