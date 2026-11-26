import { delay, HttpResponse } from 'msw'
import { UXUX_POSITIONS } from '@/features/posting/mocks/postingDetailHandlers'
import { DOCUMENT_RESULT_PAGE_SIZE } from '@/features/recruitment/types'
import type {
  ConfirmDocResultMutation,
  ConfirmDocResultMutationVariables,
  DocEvaluationSummaryQuery,
  DocEvaluationSummaryQueryVariables,
  DocResult,
  DocResultTab,
  DocSummarySort,
  SetDocResultMutation,
  SetDocResultMutationVariables,
} from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { MOCK_RESPONSE_DELAY_MS } from '@/mocks/responseDelay'
import {
  findApplication,
  getEvaluationSummary,
  getPostingApplications,
  setDocResultOverride,
} from './organizerApplicationStore'

type SummaryRow = {
  id: string
  name: string
  positionId: string
  docResult: DocResult
  averageScore: number | null
  opinionCounts: { pass: number; hold: number; fail: number; notEvaluated: number }
  evaluationComplete: boolean
  // 샘플 순서가 앞일수록 최근 제출
  submitOrder: number
}

// 평가 완료된 지원자끼리 평균 내림차순, 같으면 합격 의견 수·제출일 오래된 순
function compareRank(a: SummaryRow, b: SummaryRow) {
  return (
    (b.averageScore ?? 0) - (a.averageScore ?? 0) ||
    b.opinionCounts.pass - a.opinionCounts.pass ||
    b.submitOrder - a.submitOrder
  )
}

function withRank(rows: readonly SummaryRow[]) {
  const ranked = rows.filter((row) => row.evaluationComplete).sort(compareRank)
  return rows.map((row) => {
    const rankIndex = ranked.indexOf(row)
    return { ...row, rank: rankIndex === -1 ? null : rankIndex + 1 }
  })
}

type RankedRow = ReturnType<typeof withRank>[number]

// 순위 없는 지원자는 정렬 방향과 관계없이 뒤로
function compareByRank(a: RankedRow, b: RankedRow, direction: 1 | -1) {
  if (a.rank === null || b.rank === null) {
    return (a.rank === null ? 1 : 0) - (b.rank === null ? 1 : 0)
  }
  return (a.rank - b.rank) * direction
}

function compareRows(a: RankedRow, b: RankedRow, sort: DocSummarySort) {
  switch (sort) {
    case 'SCORE_DESC':
      return compareByRank(a, b, 1)
    case 'SCORE_ASC':
      return compareByRank(a, b, -1)
    case 'NAME_ASC':
      return a.name.localeCompare(b.name, 'ko')
    case 'NAME_DESC':
      return b.name.localeCompare(a.name, 'ko')
    case 'PASS_OPINION_DESC':
      return b.opinionCounts.pass - a.opinionCounts.pass || a.name.localeCompare(b.name, 'ko')
  }
}

function matchesTab(row: SummaryRow, tab: DocResultTab) {
  return tab === 'ALL' || row.docResult === tab
}

function countResult(rows: readonly SummaryRow[], docResult: DocResult) {
  return rows.filter((row) => row.docResult === docResult).length
}

// 공고 상태·내 평가·결과 변경을 반영한 공고 전체 지원자, 단체 공고가 아니면 null
function getPostingRows(postingId: string) {
  const found = getPostingApplications(postingId)

  if (!found) {
    return null
  }

  const { posting, sample, applications } = found
  const rows = withRank(
    applications.map((application, index) => ({
      id: application.id,
      name: application.name,
      positionId: application.positionId,
      submitOrder: index,
      ...getEvaluationSummary(application, posting.status),
    })),
  )
  return { posting, sample, rows }
}

function getSummary(rows: readonly SummaryRow[], docResultConfirmedAt: string | null) {
  const evaluatedCount = rows.filter((row) => row.evaluationComplete).length
  const holdCount = countResult(rows, 'HOLD')
  const pendingCount = countResult(rows, 'PENDING')
  const allEvaluated = evaluatedCount === rows.length

  return {
    totalCount: rows.length,
    evaluatedCount,
    allEvaluated,
    passCount: countResult(rows, 'PASS'),
    holdCount,
    failCount: countResult(rows, 'FAIL'),
    pendingCount,
    canConfirm: allEvaluated && holdCount === 0 && pendingCount === 0 && rows.length > 0,
    docResultConfirmedAt,
  }
}

// 명세의 EVALUATION_422 reason, 위에서부터 처음 맞는 하나
function getConfirmBlockReason(summary: ReturnType<typeof getSummary>) {
  if (summary.totalCount === 0) {
    return 'NO_APPLICANTS'
  }
  if (!summary.allEvaluated) {
    return 'NOT_ALL_EVALUATED'
  }
  if (summary.pendingCount > 0) {
    return 'RESULT_NOT_SELECTED'
  }
  if (summary.holdCount > 0) {
    return 'HOLD_REMAINING'
  }
  return null
}

function errorBody(code: string, message: string, extensions: Record<string, string> = {}) {
  return { errors: [{ message, extensions: { code, ...extensions } }], data: null }
}

const POSTING_NOT_FOUND_ERROR = ['POSTING_404', '공고를 찾을 수 없습니다.'] as const
const RESULT_LOCKED_ERROR = [
  'EVALUATION_409',
  '평가가 끝나지 않은 지원자가 포함되었거나 결과가 이미 확정되었습니다.',
] as const

const documentResultHandlers = [
  graphqlApi.query<DocEvaluationSummaryQuery, DocEvaluationSummaryQueryVariables>(
    'DocEvaluationSummary',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const postingRows = getPostingRows(String(variables.postingId))

      if (!postingRows) {
        return HttpResponse.json(errorBody(...POSTING_NOT_FOUND_ERROR))
      }

      const { posting, sample, rows } = postingRows
      const { positionIds, keyword, tab, sort, page } = variables
      if (page !== null && page !== undefined && page < 1) {
        return HttpResponse.json(errorBody('COMMON_400', 'page는 1 이상이어야 합니다.'))
      }

      // GraphQL의 리스트 입력은 단일 ID로도 전달할 수 있음
      const selectedPositionIds =
        positionIds == null
          ? []
          : (Array.isArray(positionIds) ? positionIds : [positionIds]).map(String)

      // 포지션 숫자는 검색어만, 탭 숫자는 검색어·포지션 필터만 적용
      const searched = rows.filter(({ name }) => name.includes(keyword ?? ''))
      const selected = searched.filter(
        ({ positionId }) =>
          selectedPositionIds.length === 0 ||
          (!sample.noPosition && selectedPositionIds.includes(positionId)),
      )
      const list = selected
        .filter((row) => matchesTab(row, tab ?? 'ALL'))
        .sort((a, b) => compareRows(a, b, sort ?? 'SCORE_DESC'))
      const totalPages = Math.ceil(list.length / DOCUMENT_RESULT_PAGE_SIZE)
      // 다른 목록 MSW와 동일하게 범위 밖 페이지는 마지막 페이지로 맞춤
      const currentPage = Math.min(Math.max(page ?? 1, 1), Math.max(totalPages, 1))
      const pageStart = (currentPage - 1) * DOCUMENT_RESULT_PAGE_SIZE

      return HttpResponse.json({
        data: {
          docEvaluationSummary: {
            rows: list.slice(pageStart, pageStart + DOCUMENT_RESULT_PAGE_SIZE).map((row) => ({
              application: {
                id: row.id,
                user: { name: row.name },
                position: sample.noPosition
                  ? null
                  : {
                      id: row.positionId,
                      name: UXUX_POSITIONS.find(({ id }) => id === row.positionId)?.name ?? '',
                    },
                docResult: row.docResult,
              },
              rank: row.rank,
              averageScore: row.averageScore,
              opinionCounts: row.opinionCounts,
              evaluationComplete: row.evaluationComplete,
            })),
            tabCounts: {
              all: selected.length,
              pass: countResult(selected, 'PASS'),
              hold: countResult(selected, 'HOLD'),
              fail: countResult(selected, 'FAIL'),
            },
            positionCounts: sample.noPosition
              ? []
              : UXUX_POSITIONS.map((position) => ({
                  position: { id: position.id, name: position.name },
                  count: searched.filter((row) => row.positionId === position.id).length,
                })),
            page: currentPage,
            totalPages,
            summary: getSummary(rows, posting.docResultConfirmedAt),
          },
        },
      })
    },
  ),
  graphqlApi.mutation<SetDocResultMutation, SetDocResultMutationVariables>(
    'SetDocResult',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const { applicationIds, result } = variables
      const ids = (Array.isArray(applicationIds) ? applicationIds : [applicationIds]).map(String)
      const targets = ids.map(findApplication)

      if (targets.some((target) => !target)) {
        return HttpResponse.json(errorBody('APPLICATION_404', '지원서를 찾을 수 없습니다.'))
      }

      const isLocked = targets.some(
        (target) =>
          !target ||
          target.posting.docResultConfirmedAt ||
          !getEvaluationSummary(target.application, target.posting.status).evaluationComplete,
      )
      if (isLocked) {
        return HttpResponse.json(errorBody(...RESULT_LOCKED_ERROR))
      }

      ids.forEach((id) => setDocResultOverride(id, result))

      return HttpResponse.json({
        data: { setDocResult: ids.map((id) => ({ id, docResult: result })) },
      })
    },
  ),
  graphqlApi.mutation<ConfirmDocResultMutation, ConfirmDocResultMutationVariables>(
    'ConfirmDocResult',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const postingRows = getPostingRows(String(variables.postingId))

      if (!postingRows) {
        return HttpResponse.json(errorBody(...POSTING_NOT_FOUND_ERROR))
      }

      const { posting, rows } = postingRows
      if (posting.docResultConfirmedAt) {
        return HttpResponse.json(errorBody('EVALUATION_423', '이미 결과를 확정했습니다.'))
      }

      const reason = getConfirmBlockReason(getSummary(rows, null))
      if (reason) {
        return HttpResponse.json(
          errorBody('EVALUATION_422', '결과를 확정할 수 없습니다.', { reason }),
        )
      }

      // 운영진 홈·지원자 관리·서류 평가 MSW도 확정 후 상태를 보도록 공고 상태 변경
      posting.status = 'DOC_RESULT_NOTICE'
      posting.docResultConfirmedAt = new Date().toISOString()

      return HttpResponse.json({
        data: {
          confirmDocResult: {
            posting: { id: posting.id, docResultConfirmedAt: posting.docResultConfirmedAt },
          },
        },
      })
    },
  ),
]

export { documentResultHandlers }
