import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getPostingCreateSteps } from '@/features/posting/utils/postingCreateSteps'
import { usePostingCreateStep } from './usePostingCreateStep'

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
}))

const NEW_POSTING_PATH = '/manage/postings/new?interview=true'
const INTERVIEW_STEPS = getPostingCreateSteps(true)
const NO_INTERVIEW_STEPS = getPostingCreateSteps(false)

function getCurrentHref() {
  return `${window.location.pathname}${window.location.search}`
}

function renderStep(href: string, steps = INTERVIEW_STEPS, initialFurthestIndex = 0) {
  window.history.replaceState(null, '', href)
  return renderHook(() => usePostingCreateStep({ steps, initialFurthestIndex }))
}

describe('usePostingCreateStep', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('step이 없으면 이어 쓸 단계를 보여 주고 주소에 기록한다', () => {
    const { result } = renderStep('/manage/postings/posting-1/edit', INTERVIEW_STEPS, 2)

    expect(result.current.stepIndex).toBe(2)
    expect(getCurrentHref()).toBe('/manage/postings/posting-1/edit?step=method')
  })

  it('새 공고는 step이 없으면 첫 단계를 주소에 기록한다', () => {
    const { result } = renderStep(NEW_POSTING_PATH)

    expect(result.current.stepIndex).toBe(0)
    expect(getCurrentHref()).toBe(`${NEW_POSTING_PATH}&step=info`)
  })

  it('갈 수 있는 단계 주소면 그 단계를 보여 준다', () => {
    const { result } = renderStep(`${NEW_POSTING_PATH}&step=schedule`, INTERVIEW_STEPS, 2)

    expect(result.current.stepIndex).toBe(1)
    expect(getCurrentHref()).toBe(`${NEW_POSTING_PATH}&step=schedule`)
  })

  it('아직 갈 수 없는 단계 주소면 갈 수 있는 가장 먼 단계로 주소를 바꾼다', () => {
    const { result } = renderStep(`${NEW_POSTING_PATH}&step=review`, INTERVIEW_STEPS, 2)

    expect(result.current.stepIndex).toBe(2)
    expect(getCurrentHref()).toBe(`${NEW_POSTING_PATH}&step=method`)
  })

  it('처음 작성하는 공고는 다른 단계 주소로 들어와도 첫 단계 주소로 바꾼다', () => {
    const { result } = renderStep(`${NEW_POSTING_PATH}&step=form`)

    expect(result.current.stepIndex).toBe(0)
    expect(getCurrentHref()).toBe(`${NEW_POSTING_PATH}&step=info`)
  })

  it('비면접 공고에 면접 시간 단계 주소로 들어오면 없는 단계로 본다', () => {
    const { result } = renderStep(
      '/manage/postings/new?interview=false&step=interview',
      NO_INTERVIEW_STEPS,
      4,
    )

    expect(result.current.stepIndex).toBe(4)
    expect(getCurrentHref()).toBe('/manage/postings/new?interview=false&step=review')
  })

  it('단계를 옮기면 주소에 기록하고 갈 수 있는 단계를 넓힌다', () => {
    const { result, rerender } = renderStep(NEW_POSTING_PATH)
    const historyLength = window.history.length

    act(() => result.current.moveToStep(1))
    rerender()

    expect(getCurrentHref()).toBe(`${NEW_POSTING_PATH}&step=schedule`)
    expect(window.history.length).toBe(historyLength + 1)
    expect(result.current.stepIndex).toBe(1)
    expect(result.current.furthestIndex).toBe(1)
  })

  it('첫 단계로 돌아가면 첫 단계를 주소에 기록하고 갈 수 있는 단계는 유지한다', () => {
    const { result, rerender } = renderStep(`${NEW_POSTING_PATH}&step=method`, INTERVIEW_STEPS, 2)

    act(() => result.current.moveToStep(0))
    rerender()

    expect(getCurrentHref()).toBe(`${NEW_POSTING_PATH}&step=info`)
    expect(result.current.stepIndex).toBe(0)
    expect(result.current.furthestIndex).toBe(2)
  })

  it('뒤로가기로 주소가 바뀌면 그 단계를 보여 준다', () => {
    const { result, rerender } = renderStep(NEW_POSTING_PATH)

    act(() => result.current.moveToStep(1))
    act(() => result.current.moveToStep(2))
    window.history.replaceState(null, '', `${NEW_POSTING_PATH}&step=schedule`)
    rerender()

    expect(result.current.stepIndex).toBe(1)
    expect(result.current.furthestIndex).toBe(2)
  })

  it('첫 저장으로 편집 주소가 되면 바뀐 주소에 단계를 기록한다', () => {
    const { result } = renderStep(NEW_POSTING_PATH)

    window.history.replaceState(null, '', '/manage/postings/posting-1/edit')
    act(() => result.current.moveToStep(1))

    expect(getCurrentHref()).toBe('/manage/postings/posting-1/edit?step=schedule')
  })
})
