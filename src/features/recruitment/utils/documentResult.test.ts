import { describe, expect, it } from 'vitest'
import type { DocumentResultTotals } from '@/features/recruitment/types'
import type { DocEvaluationSummaryQuery, DocResult } from '@/gql/graphql'
import {
  applyDocResultChange,
  getDocumentResultFilterEmptyDescription,
  getDocumentResultNextStepMessage,
  getDocumentResultSummary,
  hasInterviewStepAfterConfirm,
} from './documentResult'

const READY_TOTALS = {
  totalCount: 48,
  evaluatedCount: 48,
  isAllEvaluated: true,
  passCount: 20,
  holdCount: 0,
  failCount: 28,
  pendingCount: 0,
  canConfirm: true,
} satisfies DocumentResultTotals

function createRow(id: string, docResult: DocResult) {
  return {
    rank: 1,
    averageScore: 4.5,
    evaluationComplete: true,
    application: { id, docResult, user: { name: '정세나' }, position: null },
    opinionCounts: { pass: 3, hold: 0, fail: 0, notEvaluated: 0 },
  }
}

const SUMMARY_PAGE = {
  page: 1,
  totalPages: 1,
  rows: [createRow('a', 'HOLD'), createRow('b', 'PASS')],
  tabCounts: { all: 3, pass: 1, hold: 1, fail: 0 },
  positionCounts: [],
  summary: {
    totalCount: 3,
    evaluatedCount: 3,
    allEvaluated: true,
    passCount: 1,
    holdCount: 1,
    failCount: 0,
    pendingCount: 1,
    canConfirm: false,
  },
} satisfies DocEvaluationSummaryQuery['docEvaluationSummary']

describe('applyDocResultChange', () => {
  it('바뀐 결과를 행·탭 숫자·공고 전체 인원에 반영', () => {
    const page = applyDocResultChange(SUMMARY_PAGE, 'a', {
      from: 'HOLD',
      to: 'PASS',
      isCounted: true,
    })

    expect(page.rows[0]?.application.docResult).toBe('PASS')
    expect(page.tabCounts).toEqual({ all: 3, pass: 2, hold: 0, fail: 0 })
    expect(page.summary).toMatchObject({ passCount: 2, holdCount: 0, pendingCount: 1 })
  })

  it('목록에 없는 지원자도 탭 숫자와 공고 전체 인원에 반영', () => {
    const page = applyDocResultChange(SUMMARY_PAGE, 'z', {
      from: 'HOLD',
      to: 'FAIL',
      isCounted: true,
    })

    expect(page.rows).toEqual(SUMMARY_PAGE.rows)
    expect(page.tabCounts).toEqual({ all: 3, pass: 1, hold: 0, fail: 1 })
    expect(page.summary).toMatchObject({ holdCount: 0, failCount: 1 })
  })

  it('포지션·검색 조건에 들지 않는 지원자는 공고 전체 인원만 반영', () => {
    const page = applyDocResultChange(SUMMARY_PAGE, 'z', {
      from: 'HOLD',
      to: 'FAIL',
      isCounted: false,
    })

    expect(page.tabCounts).toEqual(SUMMARY_PAGE.tabCounts)
    expect(page.summary).toMatchObject({ holdCount: 0, failCount: 1 })
  })

  it('미선택에서 고르면 전체 탭은 그대로, 남은 조건이 없으면 확정 가능', () => {
    const page = applyDocResultChange(
      {
        ...SUMMARY_PAGE,
        rows: [createRow('a', 'PENDING')],
        summary: { ...SUMMARY_PAGE.summary, holdCount: 0 },
      },
      'a',
      { from: 'PENDING', to: 'FAIL', isCounted: true },
    )

    expect(page.tabCounts).toEqual({ all: 3, pass: 1, hold: 1, fail: 1 })
    expect(page.summary).toMatchObject({ pendingCount: 0, failCount: 1, canConfirm: true })
  })

  it('보류로 바꾸면 확정 불가', () => {
    const page = applyDocResultChange(
      {
        ...SUMMARY_PAGE,
        summary: { ...SUMMARY_PAGE.summary, holdCount: 0, pendingCount: 0, canConfirm: true },
      },
      'b',
      { from: 'PASS', to: 'HOLD', isCounted: true },
    )

    expect(page.summary).toMatchObject({ holdCount: 1, canConfirm: false })
  })

  it('저장된 결과로 되돌리면 그대로 유지', () => {
    expect(
      applyDocResultChange(SUMMARY_PAGE, 'a', { from: 'HOLD', to: 'HOLD', isCounted: true }),
    ).toBe(SUMMARY_PAGE)
  })
})

describe('getDocumentResultSummary', () => {
  it('공고 전체 지원자가 0명이면 대상자 없음 안내', () => {
    expect(
      getDocumentResultSummary(
        {
          ...READY_TOTALS,
          totalCount: 0,
          evaluatedCount: 0,
          passCount: 0,
          failCount: 0,
          canConfirm: false,
        },
        0,
      ),
    ).toEqual({
      status: 'blocked',
      message: '서류 평가 대상자가 없어 결과를 확정할 수 없어요.',
      canConfirm: false,
    })
  })

  it('평가가 끝나지 않은 지원자가 있으면 보류보다 먼저 안내', () => {
    expect(
      getDocumentResultSummary(
        {
          ...READY_TOTALS,
          evaluatedCount: 45,
          isAllEvaluated: false,
          holdCount: 4,
          canConfirm: false,
        },
        4,
      ),
    ).toEqual({
      status: 'blocked',
      message: '아직 평가가 끝나지 않은 지원자가 3명 있어요.',
      canConfirm: false,
    })
  })

  it('보류 인원은 보이는 목록 기준, 확정 차단은 공고 전체 기준', () => {
    expect(
      getDocumentResultSummary({ ...READY_TOTALS, holdCount: 4, canConfirm: false }, 1),
    ).toEqual({
      status: 'blocked',
      message: '보류 중인 1명의 최종 결과를 선택해 주세요.',
      canConfirm: false,
    })
  })

  it('보류가 필터로 모두 가려지면 공고 전체 보류 인원 표시', () => {
    expect(
      getDocumentResultSummary({ ...READY_TOTALS, holdCount: 4, canConfirm: false }, 0),
    ).toMatchObject({ message: '보류 중인 4명의 최종 결과를 선택해 주세요.', canConfirm: false })
  })

  it('결과를 고르지 않은 지원자가 있으면 확정 불가', () => {
    expect(
      getDocumentResultSummary({ ...READY_TOTALS, pendingCount: 2, canConfirm: false }, 0),
    ).toMatchObject({ message: '2명의 최종 결과를 선택해 주세요.', canConfirm: false })
  })

  it('공고 전체에 보류·미선택이 없으면 보이는 목록이 비어도 확정 가능', () => {
    expect(getDocumentResultSummary(READY_TOTALS, 0)).toMatchObject({
      status: 'ready',
      canConfirm: true,
    })
  })
})

describe('hasInterviewStepAfterConfirm', () => {
  it('면접 있는 공고에 합격자가 있을 때만 면접 단계 진행', () => {
    expect(hasInterviewStepAfterConfirm(true, 1)).toBe(true)
    expect(hasInterviewStepAfterConfirm(false, 1)).toBe(false)
    expect(hasInterviewStepAfterConfirm(true, 0)).toBe(false)
  })
})

describe('getDocumentResultNextStepMessage', () => {
  it('면접 단계가 있으면 일정 등록, 없으면 결과 안내', () => {
    expect(getDocumentResultNextStepMessage(true)).toBe(
      '면접 일정을 등록하고 지원자에게 안내해 주세요.',
    )
    expect(getDocumentResultNextStepMessage(false)).toBe(
      '지원자에게 서류 전형 결과를 안내해 주세요.',
    )
  })
})

describe('getDocumentResultFilterEmptyDescription', () => {
  it('선택한 포지션과 탭을 문구에 표시', () => {
    expect(
      getDocumentResultFilterEmptyDescription({ status: 'hold', positionLabels: ['기획'] }),
    ).toBe('기획 포지션에는 보류한 지원자가 없어요. 다른 탭이나 포지션을 골라 보세요.')
  })

  it('포지션 여러 개는 가운뎃점으로 연결', () => {
    expect(
      getDocumentResultFilterEmptyDescription({
        status: 'fail',
        positionLabels: ['디자인', '기획'],
      }),
    ).toBe('디자인 · 기획 포지션에는 불합격한 지원자가 없어요. 다른 탭이나 포지션을 골라 보세요.')
  })

  it('포지션 전체·전체 탭은 해당 부분 생략', () => {
    expect(getDocumentResultFilterEmptyDescription({ status: 'all', positionLabels: [] })).toBe(
      '지원자가 없어요. 다른 탭이나 포지션을 골라 보세요.',
    )
  })
})
