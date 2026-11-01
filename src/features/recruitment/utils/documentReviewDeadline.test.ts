import { describe, expect, it } from 'vitest'
import { canEditDocumentReview } from './documentReviewDeadline'

describe('canEditDocumentReview', () => {
  const DEADLINE = '2026-10-23T23:59:59+09:00'

  it('마감 전에는 평가 수정 가능', () => {
    expect(canEditDocumentReview(DEADLINE, new Date('2026-10-23T23:59:58+09:00'))).toBe(true)
  })

  it('마감 시각부터는 평가 수정 불가', () => {
    expect(canEditDocumentReview(DEADLINE, new Date('2026-10-23T23:59:59+09:00'))).toBe(false)
    expect(canEditDocumentReview(DEADLINE, new Date('2026-10-24T00:00:00+09:00'))).toBe(false)
  })

  it('마감 시각 형식을 알 수 없으면 수정 불가로 처리', () => {
    expect(canEditDocumentReview('미정', new Date('2026-10-01T00:00:00+09:00'))).toBe(false)
  })
})
