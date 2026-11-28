import { describe, expect, it } from 'vitest'
import { getScenarioStep } from './scenarioStep'

describe('getScenarioStep', () => {
  it('운영진 홈', () => {
    expect(getScenarioStep('/manage', null)).toBe('manage_home')
  })

  it('공고 작성·이어서 작성은 step 값으로 단계 구분, 없거나 모르는 값은 첫 단계', () => {
    expect(getScenarioStep('/manage/postings/new', null)).toBe('posting_info')
    expect(getScenarioStep('/manage/postings/new', 'form')).toBe('posting_form')
    expect(getScenarioStep('/manage/postings/12/edit', 'review')).toBe('posting_review')
    expect(getScenarioStep('/manage/postings/12/edit', 'unknown')).toBe('posting_info')
  })

  it('서류 평가 목록·상세·취합과 면접 타임테이블', () => {
    expect(getScenarioStep('/manage/postings/p1/documents', null)).toBe('document_review')
    expect(getScenarioStep('/manage/postings/p1/documents/a1', null)).toBe('document_evaluation')
    expect(getScenarioStep('/manage/postings/p1/documents/summary', null)).toBe('document_result')
    expect(getScenarioStep('/manage/postings/p1/interviews/timetable', null)).toBe(
      'interview_timetable',
    )
  })

  it('시나리오 밖 화면은 null', () => {
    expect(getScenarioStep('/', null)).toBeNull()
    expect(getScenarioStep('/manage/postings/p1', null)).toBeNull()
    expect(getScenarioStep('/manage/postings/p1/documents/summary/notice', null)).toBeNull()
  })
})
