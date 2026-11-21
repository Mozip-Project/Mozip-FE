import { describe, expect, it } from 'vitest'
import { getDocumentResultChip, getInterviewResultChip } from './applicantResult'

describe('getDocumentResultChip', () => {
  it('지원 접수 단계는 평가 전', () => {
    expect(getDocumentResultChip('application', null)).toBe('pending')
  })

  it('서류 평가 단계는 평가 중', () => {
    expect(getDocumentResultChip('documentReview', null)).toBe('inProgress')
  })

  it('결과 확정 전에는 서버 결과가 있어도 합격·불합격을 숨김', () => {
    expect(getDocumentResultChip('documentReview', 'pass')).toBe('inProgress')
  })

  it('면접 모집의 서류 결과 단계는 합격·불합격 표시', () => {
    expect(getDocumentResultChip('documentResult', 'pass')).toBe('pass')
    expect(getDocumentResultChip('documentResult', 'fail')).toBe('fail')
  })

  it('비면접 모집의 최종 결과 단계도 합격·불합격 표시', () => {
    expect(getDocumentResultChip('finalResult', 'fail')).toBe('fail')
  })
})

describe('getInterviewResultChip', () => {
  it('결과 확정 전에는 모두 평가 전', () => {
    expect(getInterviewResultChip('application', null)).toBe('pending')
    expect(getInterviewResultChip('documentReview', 'fail')).toBe('pending')
  })

  it('결과 확정 후 서류 합격자는 평가 전', () => {
    expect(getInterviewResultChip('documentResult', 'pass')).toBe('pending')
  })

  it('결과 확정 후 서류 불합격자는 빈칸', () => {
    expect(getInterviewResultChip('documentResult', 'fail')).toBeNull()
  })
})
