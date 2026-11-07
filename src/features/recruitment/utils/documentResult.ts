import {
  DOCUMENT_REVIEW_POSITION_LABEL,
  type DocumentResult,
  type DocumentResultApplicantPage,
  type DocumentResultQuery,
  type DocumentResultStatus,
} from '@/features/recruitment/types'
import { hasPositionFilter } from './boardQuery'

type DocumentResultChange = {
  applicantId: string
  result: DocumentResult
}

// 현재 목록의 행과 탭 숫자에 바로 반영, 다른 조건의 목록은 재조회로 갱신
function applyDocumentResultChange(
  page: DocumentResultApplicantPage,
  { applicantId, result }: DocumentResultChange,
): DocumentResultApplicantPage {
  const applicant = page.applicants.find(({ id }) => id === applicantId)

  if (!applicant || applicant.result === result) {
    return page
  }

  const previousResult = applicant.result
  const statusCounts: Record<DocumentResultStatus, number> = {
    ...page.statusCounts,
    [previousResult]: page.statusCounts[previousResult] - 1,
    [result]: page.statusCounts[result] + 1,
  }
  const totalResultCounts: Record<DocumentResult, number> = {
    ...page.totalResultCounts,
    [previousResult]: page.totalResultCounts[previousResult] - 1,
    [result]: page.totalResultCounts[result] + 1,
  }

  return {
    ...page,
    applicants: page.applicants.map((item) =>
      item.id === applicantId ? { ...item, result } : item,
    ),
    statusCounts,
    totalResultCounts,
  }
}

type DocumentResultSummary = {
  status: 'blocked' | 'ready'
  message: string
  canConfirm: boolean
}

// 확정 가능 여부는 탭·필터·검색과 무관한 공고 전체 기준, 위에서부터 처음 맞는 상태 하나만 적용
// TODO: 평가 완료 여부 API 확정 후 '평가 진행 중' 상태를 보류 판정보다 먼저 추가
function getDocumentResultSummary({
  statusCounts,
  totalResultCounts: { pass, hold, fail },
}: Pick<DocumentResultApplicantPage, 'statusCounts' | 'totalResultCounts'>): DocumentResultSummary {
  if (pass + hold + fail === 0) {
    return {
      status: 'blocked',
      message: '서류 평가 대상자가 없어 결과를 확정할 수 없어요.',
      canConfirm: false,
    }
  }

  if (hold > 0) {
    // 보이는 목록 기준 인원, 필터로 모두 가려지면 '0명' 대신 공고 전체 인원 표시
    const visibleHoldCount = statusCounts.hold > 0 ? statusCounts.hold : hold

    return {
      status: 'blocked',
      message: `보류 중인 ${visibleHoldCount}명의 최종 결과를 선택해 주세요.`,
      canConfirm: false,
    }
  }

  return {
    status: 'ready',
    message: '확정 후에는 결과를 변경할 수 없어요.',
    canConfirm: true,
  }
}

// 면접 있는 공고라도 합격자가 없으면 면접 단계 생략
function hasInterviewStepAfterConfirm(
  hasInterview: boolean,
  totalResultCounts: DocumentResultApplicantPage['totalResultCounts'],
) {
  return hasInterview && totalResultCounts.pass > 0
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
  positions,
}: Pick<DocumentResultQuery, 'status' | 'positions'>) {
  const positionPart = hasPositionFilter(positions)
    ? `${positions.map((position) => DOCUMENT_REVIEW_POSITION_LABEL[position]).join(' · ')} 포지션에는 `
    : ''

  return `${positionPart}${RESULT_TAB_ADJECTIVE[status]}지원자가 없어요. 다른 탭이나 포지션을 골라 보세요.`
}

export {
  applyDocumentResultChange,
  getDocumentResultFilterEmptyDescription,
  getDocumentResultNextStepMessage,
  getDocumentResultSummary,
  hasInterviewStepAfterConfirm,
}
export type { DocumentResultChange }
