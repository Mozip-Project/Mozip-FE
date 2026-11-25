import { describe, expect, it } from 'vitest'
import {
  getDocumentResultChip,
  getDocumentResultPhase,
  getInterviewResultChip,
} from './applicantResult'

const CONFIRMED_AT = '2026-10-18T10:00:00+09:00'

describe('getDocumentResultPhase', () => {
  it('지원 접수 중은 평가 전', () => {
    expect(getDocumentResultPhase('RECRUITING', null)).toBe('beforeReview')
  })

  it('작성 중도 평가 전', () => {
    expect(getDocumentResultPhase('DRAFT', null)).toBe('beforeReview')
  })

  it('서류 평가 중이고 확정 전이면 평가 중', () => {
    expect(getDocumentResultPhase('DOC_REVIEW', null)).toBe('inReview')
  })

  it('확정 시각 없이 이후 단계가 오면 평가 중', () => {
    expect(getDocumentResultPhase('INTERVIEW', null)).toBe('inReview')
    expect(getDocumentResultPhase('DOC_RESULT_NOTICE', null)).toBe('inReview')
  })

  it('확정 시각이 있으면 공고 상태와 무관하게 확정', () => {
    expect(getDocumentResultPhase('DOC_REVIEW', CONFIRMED_AT)).toBe('confirmed')
    expect(getDocumentResultPhase('ENDED', CONFIRMED_AT)).toBe('confirmed')
  })
})

describe('getDocumentResultChip', () => {
  it('확정 전에는 서버 결과가 있어도 합격·불합격을 숨김', () => {
    expect(getDocumentResultChip('beforeReview', 'PASS')).toBe('pending')
    expect(getDocumentResultChip('inReview', 'FAIL')).toBe('inProgress')
  })

  it('확정 후에는 서버 결과 그대로', () => {
    expect(getDocumentResultChip('confirmed', 'PASS')).toBe('pass')
    expect(getDocumentResultChip('confirmed', 'FAIL')).toBe('fail')
  })
})

describe('getInterviewResultChip', () => {
  it('확정 전에는 모두 평가 전', () => {
    expect(
      getInterviewResultChip('beforeReview', { documentResult: 'PENDING', finalResult: 'PENDING' }),
    ).toBe('pending')
    expect(
      getInterviewResultChip('inReview', { documentResult: 'FAIL', finalResult: 'PENDING' }),
    ).toBe('pending')
  })

  it('서류 합격자는 최종 결과 표시, PENDING은 평가 전', () => {
    expect(
      getInterviewResultChip('confirmed', { documentResult: 'PASS', finalResult: 'PENDING' }),
    ).toBe('pending')
    expect(
      getInterviewResultChip('confirmed', { documentResult: 'PASS', finalResult: 'PASS' }),
    ).toBe('pass')
    expect(
      getInterviewResultChip('confirmed', { documentResult: 'PASS', finalResult: 'FAIL' }),
    ).toBe('fail')
  })

  it('서류 불합격자는 빈칸', () => {
    expect(
      getInterviewResultChip('confirmed', { documentResult: 'FAIL', finalResult: 'FAIL' }),
    ).toBeNull()
  })
})
