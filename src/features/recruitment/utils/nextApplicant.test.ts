import { describe, expect, it } from 'vitest'
import { findNextApplicantToEvaluate } from './nextApplicant'

const APPLICANTS = [
  { id: '1', isDone: false },
  { id: '2', isDone: true },
  { id: '3', isDone: false },
  { id: '4', isDone: true },
  { id: '5', isDone: false },
]

describe('findNextApplicantToEvaluate', () => {
  it('현재 지원자 뒤의 평가 전 지원자로 이동, 평가 완료 지원자는 건너뜀', () => {
    expect(findNextApplicantToEvaluate(APPLICANTS, '1')).toEqual({ id: '3', isWrapped: false })
    expect(findNextApplicantToEvaluate(APPLICANTS, '3')).toEqual({ id: '5', isWrapped: false })
  })

  it('평가 완료 지원자를 보고 있어도 뒤의 평가 전 지원자로 이동', () => {
    expect(findNextApplicantToEvaluate(APPLICANTS, '2')).toEqual({ id: '3', isWrapped: false })
  })

  it('마지막 순서면 앞쪽의 평가 전 지원자로 돌아감', () => {
    expect(findNextApplicantToEvaluate(APPLICANTS, '5')).toEqual({ id: '1', isWrapped: true })
  })

  it('뒤에 평가 전 지원자가 없으면 앞쪽으로 돌아감', () => {
    const applicants = [
      { id: '1', isDone: false },
      { id: '2', isDone: false },
      { id: '3', isDone: true },
    ]

    expect(findNextApplicantToEvaluate(applicants, '2')).toEqual({ id: '1', isWrapped: true })
  })

  it('현재 지원자 말고 평가 전 지원자가 없으면 null', () => {
    const applicants = [
      { id: '1', isDone: true },
      { id: '2', isDone: false },
      { id: '3', isDone: true },
    ]

    expect(findNextApplicantToEvaluate(applicants, '2')).toBeNull()
  })

  it('목록에 없는 지원자면 처음부터 찾음', () => {
    expect(findNextApplicantToEvaluate(APPLICANTS, '99')).toEqual({ id: '1', isWrapped: false })
  })
})
