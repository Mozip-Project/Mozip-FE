import { describe, expect, it } from 'vitest'
import {
  createApplicationInfoSchema,
  EMPTY_APPLICATION_INFO,
  type ApplicationInfoRule,
  type ApplicationInfoValues,
} from './applicationInfoSchema'

const POSITION_RULE = {
  selectablePositionIds: ['design', 'dev'],
  requiresProfilePhoto: false,
  hasSavedPhoto: false,
} satisfies ApplicationInfoRule

const FILLED_VALUES = {
  ...EMPTY_APPLICATION_INFO,
  positionId: 'design',
  department: '컴퓨터공학과',
  grade: 'year3',
} satisfies ApplicationInfoValues

function isValid(values: ApplicationInfoValues, rule: ApplicationInfoRule = POSITION_RULE) {
  return createApplicationInfoSchema(rule).safeParse(values).success
}

describe('createApplicationInfoSchema', () => {
  it('포지션·학과·학년이 있으면 통과', () => {
    expect(isValid(FILLED_VALUES)).toBe(true)
  })

  it('빈 기본값은 실패', () => {
    expect(isValid(EMPTY_APPLICATION_INFO)).toBe(false)
  })

  it('공백뿐인 학과나 학년이 없으면 실패', () => {
    expect(isValid({ ...FILLED_VALUES, department: '   ' })).toBe(false)
    expect(isValid({ ...FILLED_VALUES, grade: null })).toBe(false)
  })

  it('포지션 있는 모집은 지원 가능한 포지션을 골라야 통과', () => {
    expect(isValid({ ...FILLED_VALUES, positionId: '' })).toBe(false)
    // 이미 지원한 포지션은 선택 목록에서 빠짐
    expect(isValid({ ...FILLED_VALUES, positionId: 'plan' })).toBe(false)
  })

  it('포지션 없는 모집은 포지션 없이 통과', () => {
    const directRule = { ...POSITION_RULE, selectablePositionIds: null }

    expect(isValid({ ...FILLED_VALUES, positionId: '' }, directRule)).toBe(true)
  })

  it('사진 필수 공고는 저장된 사진이나 새로 고른 사진이 있어야 통과', () => {
    const photoRule = { ...POSITION_RULE, requiresProfilePhoto: true }
    const photo = new File(['image'], 'profile.png', { type: 'image/png' })

    expect(isValid(FILLED_VALUES, photoRule)).toBe(false)
    expect(isValid({ ...FILLED_VALUES, photo }, photoRule)).toBe(true)
    expect(isValid(FILLED_VALUES, { ...photoRule, hasSavedPhoto: true })).toBe(true)
  })
})
