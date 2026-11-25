import type {
  DocumentResultQuery,
  DocumentResultStatus,
  DocumentResultTotals,
} from '@/features/recruitment/types'
import type { DocEvaluationSummaryQuery, DocResult } from '@/gql/graphql'

type DocEvaluationSummaryPage = DocEvaluationSummaryQuery['docEvaluationSummary']

// 미선택(PENDING)은 전체 탭에만 포함
const DOC_RESULT_TAB_COUNT_KEY = {
  PENDING: null,
  PASS: 'pass',
  HOLD: 'hold',
  FAIL: 'fail',
} satisfies Record<DocResult, keyof DocEvaluationSummaryPage['tabCounts'] | null>

const DOC_RESULT_SUMMARY_COUNT_KEY = {
  PENDING: 'pendingCount',
  PASS: 'passCount',
  HOLD: 'holdCount',
  FAIL: 'failCount',
} satisfies Record<DocResult, keyof DocEvaluationSummaryPage['summary']>

function moveCount<TKey extends string>(
  counts: Record<TKey, number>,
  from: TKey | null,
  to: TKey | null,
): Record<TKey, number> {
  const next = { ...counts }
  if (from) {
    next[from] -= 1
  }
  if (to) {
    next[to] += 1
  }
  return next
}

type DocResultChange = {
  // 서버에 저장된 결과
  from: DocResult
  to: DocResult
  // 지금 포지션·검색 조건에 드는 지원자만 탭 숫자 반영
  isCounted: boolean
}

// 저장 전 변경을 화면에 반영, 공고 전체 집계는 항상·탭 숫자는 조건에 들 때만
// 행은 이 목록에 있을 때만 바꾸고, 탭 이동으로 생기거나 빠지는 행은 재조회로 갱신
function applyDocResultChange(
  page: DocEvaluationSummaryPage,
  applicationId: string,
  { from, to, isCounted }: DocResultChange,
): DocEvaluationSummaryPage {
  if (from === to) {
    return page
  }

  const summary = {
    ...page.summary,
    ...moveCount(
      {
        passCount: page.summary.passCount,
        holdCount: page.summary.holdCount,
        failCount: page.summary.failCount,
        pendingCount: page.summary.pendingCount,
      },
      DOC_RESULT_SUMMARY_COUNT_KEY[from],
      DOC_RESULT_SUMMARY_COUNT_KEY[to],
    ),
  }

  return {
    ...page,
    rows: page.rows.map((row) =>
      row.application.id === applicationId
        ? { ...row, application: { ...row.application, docResult: to } }
        : row,
    ),
    tabCounts: isCounted
      ? moveCount<keyof DocEvaluationSummaryPage['tabCounts']>(
          page.tabCounts,
          DOC_RESULT_TAB_COUNT_KEY[from],
          DOC_RESULT_TAB_COUNT_KEY[to],
        )
      : page.tabCounts,
    summary: {
      ...summary,
      canConfirm:
        summary.allEvaluated &&
        summary.holdCount === 0 &&
        summary.pendingCount === 0 &&
        summary.totalCount > 0,
    },
  }
}

type DocumentResultSummary = {
  status: 'blocked' | 'ready'
  message: string
  canConfirm: boolean
}

// 확정 가능 여부는 탭·필터·검색과 무관한 공고 전체 기준, 위에서부터 처음 맞는 상태 하나만 적용
// TODO: 평가 진행 중·결과 미선택 문구 디자인 확인 필요
function getDocumentResultSummary(
  totals: DocumentResultTotals,
  // 필터·검색 적용 후 보류 탭 인원
  visibleHoldCount: number,
): DocumentResultSummary {
  if (totals.totalCount === 0) {
    return {
      status: 'blocked',
      message: '서류 평가 대상자가 없어 결과를 확정할 수 없어요.',
      canConfirm: false,
    }
  }

  if (!totals.isAllEvaluated) {
    return {
      status: 'blocked',
      message: `아직 평가가 끝나지 않은 지원자가 ${totals.totalCount - totals.evaluatedCount}명 있어요.`,
      canConfirm: false,
    }
  }

  if (totals.holdCount > 0) {
    // 보이는 목록 기준 인원, 필터로 모두 가려지면 '0명' 대신 공고 전체 인원 표시
    const holdCount = visibleHoldCount > 0 ? visibleHoldCount : totals.holdCount

    return {
      status: 'blocked',
      message: `보류 중인 ${holdCount}명의 최종 결과를 선택해 주세요.`,
      canConfirm: false,
    }
  }

  if (totals.pendingCount > 0) {
    return {
      status: 'blocked',
      message: `${totals.pendingCount}명의 최종 결과를 선택해 주세요.`,
      canConfirm: false,
    }
  }

  return {
    status: 'ready',
    message: '확정 후에는 결과를 변경할 수 없어요.',
    canConfirm: totals.canConfirm,
  }
}

// 면접 있는 공고라도 합격자가 없으면 면접 단계 생략
function hasInterviewStepAfterConfirm(hasInterview: boolean, passCount: number) {
  return hasInterview && passCount > 0
}

function getDocumentResultNextStepMessage(hasInterviewStep: boolean) {
  return hasInterviewStep
    ? '면접 일정을 등록하고 지원자에게 안내해 주세요.'
    : '지원자에게 서류 전형 결과를 안내해 주세요.'
}

const RESULT_TAB_ADJECTIVE = {
  all: '',
  pass: '합격한 ',
  hold: '보류한 ',
  fail: '불합격한 ',
} satisfies Record<DocumentResultStatus, string>

// 예: '기획 포지션에는 보류한 지원자가 없어요.' 포지션 전체·전체 탭은 해당 부분 생략
// TODO: 포지션 여러 개·전체 탭 문구 디자인 확인 필요
function getDocumentResultFilterEmptyDescription({
  status,
  positionLabels,
}: Pick<DocumentResultQuery, 'status'> & { positionLabels: readonly string[] }) {
  const positionPart = positionLabels.length > 0 ? `${positionLabels.join(' · ')} 포지션에는 ` : ''

  return `${positionPart}${RESULT_TAB_ADJECTIVE[status]}지원자가 없어요. 다른 탭이나 포지션을 골라 보세요.`
}

export {
  applyDocResultChange,
  getDocumentResultFilterEmptyDescription,
  getDocumentResultNextStepMessage,
  getDocumentResultSummary,
  hasInterviewStepAfterConfirm,
}
