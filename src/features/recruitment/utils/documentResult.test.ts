import { describe, expect, it } from 'vitest'
import {
  DOCUMENT_REVIEW_POSITIONS,
  type DocumentResultApplicant,
  type DocumentResultApplicantPage,
} from '@/features/recruitment/types'
import {
  applyDocumentResultChange,
  getDocumentResultFilterEmptyDescription,
  getDocumentResultNextStepMessage,
  getDocumentResultSummary,
  hasInterviewStepAfterConfirm,
} from './documentResult'

const APPLICANT = {
  id: '1',
  name: '정세나',
  position: 'design',
  rank: 1,
  opinionCounts: { pass: 3, hold: 0, fail: 0 },
  averageScore: 4.6,
  result: 'hold',
} satisfies DocumentResultApplicant

const PAGE = {
  applicants: [APPLICANT],
  statusCounts: { all: 3, pass: 1, hold: 1, fail: 1 },
  positionCounts: { design: 3, development: 0, planning: 0 },
  currentPage: 1,
  totalPages: 1,
  hasScore: true,
  totalResultCounts: { pass: 1, hold: 2, fail: 1 },
} satisfies DocumentResultApplicantPage

describe('applyDocumentResultChange', () => {
  it('바뀐 결과를 행·탭 숫자·전체 보류 인원에 반영', () => {
    const page = applyDocumentResultChange(PAGE, { applicantId: '1', result: 'pass' })

    expect(page.applicants[0]?.result).toBe('pass')
    expect(page.statusCounts).toEqual({ all: 3, pass: 2, hold: 0, fail: 1 })
    expect(page.totalResultCounts).toEqual({ pass: 2, hold: 1, fail: 1 })
  })

  it('보류로 바꾸면 전체 보류 인원 증가', () => {
    const page = applyDocumentResultChange(
      { ...PAGE, applicants: [{ ...APPLICANT, result: 'fail' }] },
      { applicantId: '1', result: 'hold' },
    )

    expect(page.totalResultCounts).toEqual({ pass: 1, hold: 3, fail: 0 })
  })

  it('같은 결과나 목록에 없는 지원자는 그대로 유지', () => {
    expect(applyDocumentResultChange(PAGE, { applicantId: '1', result: 'hold' })).toBe(PAGE)
    expect(applyDocumentResultChange(PAGE, { applicantId: '9', result: 'pass' })).toBe(PAGE)
  })
})

describe('getDocumentResultSummary', () => {
  it('공고 전체 지원자가 0명이면 대상자 없음 안내', () => {
    expect(
      getDocumentResultSummary({
        statusCounts: { all: 0, pass: 0, hold: 0, fail: 0 },
        totalResultCounts: { pass: 0, hold: 0, fail: 0 },
      }),
    ).toEqual({
      status: 'blocked',
      message: '서류 평가 대상자가 없어 결과를 확정할 수 없어요.',
      canConfirm: false,
    })
  })

  it('보류 인원은 보이는 목록 기준, 확정 차단은 공고 전체 기준', () => {
    expect(
      getDocumentResultSummary({
        statusCounts: { all: 10, pass: 4, hold: 1, fail: 5 },
        totalResultCounts: { pass: 20, hold: 4, fail: 24 },
      }),
    ).toEqual({
      status: 'blocked',
      message: '보류 중인 1명의 최종 결과를 선택해 주세요.',
      canConfirm: false,
    })
  })

  it('보류가 필터로 모두 가려지면 공고 전체 보류 인원 표시', () => {
    expect(
      getDocumentResultSummary({
        statusCounts: { all: 0, pass: 0, hold: 0, fail: 0 },
        totalResultCounts: { pass: 20, hold: 4, fail: 24 },
      }),
    ).toMatchObject({ message: '보류 중인 4명의 최종 결과를 선택해 주세요.', canConfirm: false })
  })

  it('공고 전체에 보류가 없으면 보이는 목록이 비어도 확정 가능', () => {
    expect(
      getDocumentResultSummary({
        statusCounts: { all: 0, pass: 0, hold: 0, fail: 0 },
        totalResultCounts: { pass: 20, hold: 0, fail: 28 },
      }),
    ).toMatchObject({ status: 'ready', canConfirm: true })
  })
})

describe('hasInterviewStepAfterConfirm', () => {
  it('면접 있는 공고에 합격자가 있을 때만 면접 단계 진행', () => {
    const counts = { pass: 1, hold: 0, fail: 47 }

    expect(hasInterviewStepAfterConfirm(true, counts)).toBe(true)
    expect(hasInterviewStepAfterConfirm(false, counts)).toBe(false)
    expect(hasInterviewStepAfterConfirm(true, { pass: 0, hold: 0, fail: 48 })).toBe(false)
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
      getDocumentResultFilterEmptyDescription({ status: 'hold', positions: ['planning'] }),
    ).toBe('기획 포지션에는 보류한 지원자가 없어요. 다른 탭이나 포지션을 골라 보세요.')
  })

  it('포지션 여러 개는 가운뎃점으로 연결', () => {
    expect(
      getDocumentResultFilterEmptyDescription({
        status: 'fail',
        positions: ['design', 'planning'],
      }),
    ).toBe('디자인 · 기획 포지션에는 불합격한 지원자가 없어요. 다른 탭이나 포지션을 골라 보세요.')
  })

  it('포지션 전체·전체 탭은 해당 부분 생략', () => {
    expect(
      getDocumentResultFilterEmptyDescription({
        status: 'all',
        positions: DOCUMENT_REVIEW_POSITIONS,
      }),
    ).toBe('지원자가 없어요. 다른 탭이나 포지션을 골라 보세요.')
  })
})
