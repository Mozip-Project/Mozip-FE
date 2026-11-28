import { describe, expect, it } from 'vitest'
import { getActionLabel, getStepLabel } from './scenarioLabel'

describe('scenarioLabel', () => {
  it('단계와 행동을 한글 이름으로', () => {
    expect(getStepLabel('document_result')).toBe('서류 평가 취합')
    expect(getActionLabel('timetable_slot_assign')).toBe('빈 시간에 배치')
  })

  it('이름이 없는 행동은 영어 그대로', () => {
    expect(getActionLabel('new_action')).toBe('new_action')
  })
})
