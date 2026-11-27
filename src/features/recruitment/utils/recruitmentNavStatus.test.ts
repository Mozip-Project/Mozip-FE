import { describe, expect, it } from 'vitest'
import {
  getDocumentStageStatus,
  getInterviewStageStatus,
  getPostingStageStatus,
} from './recruitmentNavStatus'

describe('getPostingStageStatus', () => {
  it('작성 중 공고는 작성 중, 게시 후 종료 전까지는 게시 중', () => {
    expect(getPostingStageStatus('DRAFT')?.label).toBe('작성 중')
    expect(getPostingStageStatus('RECRUITING')?.label).toBe('게시 중')
    expect(getPostingStageStatus('FINAL_RESULT')?.label).toBe('게시 중')
    expect(getPostingStageStatus('ENDED')).toBeNull()
  })
})

describe('getDocumentStageStatus', () => {
  it('서류 평가 중만 진행 중으로 강조, 결과 안내부터 완료', () => {
    expect(getDocumentStageStatus('RECRUITING')).toEqual({ label: '대기', isHighlighted: false })
    expect(getDocumentStageStatus('DOC_REVIEW')).toEqual({ label: '진행 중', isHighlighted: true })
    expect(getDocumentStageStatus('DOC_RESULT_NOTICE').label).toBe('완료')
  })
})

describe('getInterviewStageStatus', () => {
  it('면접 단계 전은 대기, 면접 중은 진행 중, 최종 결과부터 완료', () => {
    expect(getInterviewStageStatus('DOC_RESULT_NOTICE').label).toBe('대기')
    expect(getInterviewStageStatus('INTERVIEW')).toEqual({ label: '진행 중', isHighlighted: true })
    expect(getInterviewStageStatus('FINAL_RESULT').label).toBe('완료')
  })
})
