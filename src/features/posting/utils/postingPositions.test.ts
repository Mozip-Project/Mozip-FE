import { describe, expect, it } from 'vitest'
import { getPositionNames } from './postingPositions'

const POSITIONS = [{ name: '디자인' }, { name: '개발' }]

describe('getPositionNames', () => {
  it('포지션별 모집이면 포지션 이름 목록', () => {
    expect(getPositionNames({ recruitType: 'position', positions: POSITIONS })).toEqual([
      '디자인',
      '개발',
    ])
  })

  it('통합 모집이면 포지션이 남아 있어도 빈 목록', () => {
    expect(getPositionNames({ recruitType: 'integrated', positions: POSITIONS })).toEqual([])
  })
})
