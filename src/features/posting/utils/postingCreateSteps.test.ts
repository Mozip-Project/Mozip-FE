import { describe, expect, it } from 'vitest'
import { getPostingCreateSteps } from './postingCreateSteps'

describe('getPostingCreateSteps', () => {
  it('면접을 보면 면접 시간 설정을 포함한 6단계', () => {
    expect(getPostingCreateSteps(true).map((step) => step.label)).toEqual([
      '공고 정보',
      '모집 일정',
      '모집 방식',
      '지원서 양식',
      '면접 시간 설정',
      '검토 및 게시',
    ])
  })

  it('면접을 보지 않으면 면접 시간 설정을 뺀 5단계', () => {
    const steps = getPostingCreateSteps(false)

    expect(steps).toHaveLength(5)
    expect(steps.map((step) => step.id)).not.toContain('interview')
  })
})
