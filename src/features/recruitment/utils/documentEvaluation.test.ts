import { describe, expect, it } from 'vitest'
import { toDocumentEvaluationValues, toSaveDocEvaluationInput } from './documentEvaluation'

describe('toDocumentEvaluationValues', () => {
  it('평가 전이면 빈 폼', () => {
    expect(toDocumentEvaluationValues(null)).toEqual({ opinion: '', scores: {}, memo: '' })
  })

  it('저장된 의견·점수·메모를 폼 값으로, 비어 있는 의견·메모는 빈 값', () => {
    expect(
      toDocumentEvaluationValues({
        id: 'evaluation-1',
        status: 'DRAFT',
        opinion: null,
        memo: null,
        updatedAt: '2026-11-25T14:32:00+09:00',
        scores: [{ question: { id: 'motivation' }, score: 4 }],
      }),
    ).toEqual({ opinion: '', scores: { motivation: '4' }, memo: '' })

    expect(
      toDocumentEvaluationValues({
        id: 'evaluation-2',
        status: 'SAVED',
        opinion: 'HOLD',
        memo: '면접에서 확인',
        updatedAt: '2026-11-25T14:32:00+09:00',
        scores: [],
      }),
    ).toMatchObject({ opinion: 'hold', memo: '면접에서 확인' })
  })
})

describe('toSaveDocEvaluationInput', () => {
  const values = {
    opinion: 'pass' as const,
    scores: { motivation: '5', conflict: '', removed: '3' },
    memo: '꼼꼼함',
  }

  it('점수 문항의 고른 점수만 숫자로 보내고 목록에 없는 문항 점수는 제외', () => {
    expect(toSaveDocEvaluationInput('application-1', values, ['motivation', 'conflict'])).toEqual({
      applicationId: 'application-1',
      opinion: 'PASS',
      scores: [{ questionId: 'motivation', score: 5 }],
      memo: '꼼꼼함',
    })
  })

  it('점수 안 쓰는 공고는 scores를 보내지 않고, 고르지 않은 의견·빈 메모는 null', () => {
    expect(
      toSaveDocEvaluationInput('application-1', { opinion: '', scores: {}, memo: '' }, null),
    ).toEqual({ applicationId: 'application-1', opinion: null, scores: null, memo: null })
  })
})
