import { describe, expect, it } from 'vitest'
import {
  createPositionNameSchema,
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

describe('createPositionNameSchema', () => {
  it('앞뒤 공백을 지운 이름만 통과', () => {
    const schema = createPositionNameSchema([])

    expect(schema.safeParse({ name: '  디자인팀 ' }).data).toEqual({ name: '디자인팀' })
    expect(schema.safeParse({ name: '   ' }).success).toBe(false)
  })

  it('이미 추가한 이름은 앞뒤 공백을 지운 뒤 비교해 실패', () => {
    const schema = createPositionNameSchema(['디자인팀'])

    expect(schema.safeParse({ name: ' 디자인팀 ' }).success).toBe(false)
    expect(schema.safeParse({ name: '개발팀' }).success).toBe(true)
  })
})
