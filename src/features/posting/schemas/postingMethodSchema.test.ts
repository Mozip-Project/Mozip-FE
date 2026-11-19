import { describe, expect, it } from 'vitest'
import {
  EMPTY_POSTING_METHOD,
  postingMethodSchema,
  type PostingMethodValues,
} from './postingMethodSchema'

function isValid(values: Partial<PostingMethodValues>) {
  return postingMethodSchema.safeParse({ ...EMPTY_POSTING_METHOD, ...values }).success
}

describe('postingMethodSchema', () => {
  it('모집 유형을 고르지 않으면 실패', () => {
    expect(isValid({})).toBe(false)
  })

  it('통합 모집은 포지션 없이 통과', () => {
    expect(isValid({ recruitType: 'integrated' })).toBe(true)
  })

  it('포지션별 모집은 포지션이 1개 이상이어야 통과', () => {
    expect(isValid({ recruitType: 'position' })).toBe(false)
    expect(isValid({ recruitType: 'position', positions: [{ name: '디자인팀' }] })).toBe(true)
  })
})
