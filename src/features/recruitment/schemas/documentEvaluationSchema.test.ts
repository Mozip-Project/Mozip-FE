import { describe, expect, it } from 'vitest'
import { createSubmitSchema, documentEvaluationSchema } from './documentEvaluationSchema'

const EMPTY_VALUES = { opinion: '', scores: {}, memo: '' }

describe('documentEvaluationSchema', () => {
  it('임시저장은 비어 있는 값도 통과', () => {
    expect(documentEvaluationSchema.safeParse(EMPTY_VALUES).success).toBe(true)
  })
})

describe('createSubmitSchema', () => {
  const submitSchema = createSubmitSchema(['motivation', 'conflict'])

  it('의견과 모든 문항 점수가 있으면 통과, 메모는 비어도 됨', () => {
    const result = submitSchema.safeParse({
      opinion: 'pass',
      scores: { motivation: '5', conflict: '3' },
      memo: '',
    })

    expect(result.success).toBe(true)
  })

  it('의견이 없어도 모든 문항 점수가 있으면 통과', () => {
    const result = submitSchema.safeParse({
      ...EMPTY_VALUES,
      scores: { motivation: '5', conflict: '3' },
    })

    expect(result.success).toBe(true)
  })

  it('점수가 빠진 문항마다 해당 문항 위치에 오류', () => {
    const result = submitSchema.safeParse({
      ...EMPTY_VALUES,
      opinion: 'hold',
      scores: { motivation: '5', conflict: '' },
    })

    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: ['scores', 'conflict'], message: '점수를 선택해 주세요' }),
    ])
  })

  it('아직 고르지 않아 값이 undefined인 문항도 점수 필수 오류로 표시', () => {
    const result = submitSchema.safeParse({
      ...EMPTY_VALUES,
      opinion: 'pass',
      scores: { motivation: undefined, conflict: '3' },
    })

    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: ['scores', 'motivation'], message: '점수를 선택해 주세요' }),
    ])
  })

  it('임시저장 평가에 문항 키가 아예 없어도 점수 필수 오류로 표시', () => {
    const result = submitSchema.safeParse({
      ...EMPTY_VALUES,
      opinion: 'pass',
      scores: { conflict: '3' },
    })

    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: ['scores', 'motivation'], message: '점수를 선택해 주세요' }),
    ])
  })

  it('문항 목록에 없는 점수 키는 빈 점수여도 검사하지 않음', () => {
    const result = createSubmitSchema(['motivation']).safeParse({
      ...EMPTY_VALUES,
      opinion: 'fail',
      scores: { motivation: '1', removedQuestion: '', unknownQuestion: undefined },
    })

    expect(result.success).toBe(true)
  })
})
