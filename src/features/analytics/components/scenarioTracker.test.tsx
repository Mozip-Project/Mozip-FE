import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resetVisitor, track } from '@/lib/analytics'
import { ScenarioTracker } from './scenarioTracker'

vi.mock('@/lib/analytics', () => ({
  initAnalytics: vi.fn(),
  resetVisitor: vi.fn(),
  track: vi.fn(),
}))

const navigation = vi.hoisted(() => ({ pathname: '/manage/postings/p1/interviews/timetable' }))

vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useSearchParams: () => new URLSearchParams(),
}))

function renderTimetable() {
  render(
    <>
      <ScenarioTracker />
      <button type="button" draggable data-track-target="timetable_unassigned_select">
        최두리
      </button>
      <div data-track-drop="timetable_slot_assign">
        <span>빈 칸</span>
      </div>
      <button type="button">다른 버튼</button>
      <p>안내 문구</p>
    </>,
  )
}

function actionCalls() {
  return vi.mocked(track).mock.calls.filter(([eventName]) => eventName === 'scenario_action')
}

describe('ScenarioTracker', () => {
  beforeEach(() => {
    vi.mocked(track).mockClear()
    vi.mocked(resetVisitor).mockClear()
    navigation.pathname = '/manage/postings/p1/interviews/timetable'
  })

  it('단계 진입을 한글 단계 이름과 함께 기록', () => {
    renderTimetable()

    expect(track).toHaveBeenCalledWith('scenario_step_viewed', {
      step: 'interview_timetable',
      step_label: '면접 타임테이블',
    })
  })

  it('조작 요소 오클릭 뒤 정답 클릭이면 오클릭 수와 첫 클릭 실패를 기록, 글자 클릭은 무시', () => {
    renderTimetable()

    fireEvent.click(screen.getByText('안내 문구'))
    fireEvent.click(screen.getByRole('button', { name: '다른 버튼' }))
    fireEvent.click(screen.getByRole('button', { name: '최두리' }))

    expect(track).toHaveBeenCalledWith(
      'scenario_misclick',
      expect.objectContaining({ step: 'interview_timetable' }),
    )
    expect(actionCalls()).toHaveLength(1)
    expect(actionCalls()[0]?.[1]).toMatchObject({
      action: 'timetable_unassigned_select',
      action_label: '미배정 지원자 선택',
      misclicks_before: 1,
      is_first_click_success: false,
    })
  })

  it('정답 요소를 끌어 놓는 영역에 놓으면 집기와 놓기를 각각 정답으로 기록', () => {
    renderTimetable()

    fireEvent.dragStart(screen.getByRole('button', { name: '최두리' }))
    fireEvent.drop(screen.getByText('빈 칸'))

    expect(actionCalls().map(([, properties]) => properties?.action)).toEqual([
      'timetable_unassigned_select',
      'timetable_slot_assign',
    ])
  })

  it('정답이 아닌 요소를 끌어다 놓으면 놓기를 기록하지 않음', () => {
    renderTimetable()

    fireEvent.dragStart(screen.getByText('안내 문구'))
    fireEvent.drop(screen.getByText('빈 칸'))

    expect(actionCalls()).toHaveLength(0)
  })

  it('새 공고 만들기를 누르면 새 방문자로 바꾼 뒤 기록', () => {
    navigation.pathname = '/manage'
    render(
      <>
        <ScenarioTracker />
        <button type="button" data-track-target="home_new_posting">
          새 공고 만들기
        </button>
      </>,
    )

    fireEvent.click(screen.getByRole('button', { name: '새 공고 만들기' }))

    expect(resetVisitor).toHaveBeenCalledTimes(1)
    expect(actionCalls()[0]?.[1]).toMatchObject({
      action: 'home_new_posting',
      action_label: '새 공고 만들기',
      step_label: '운영진 홈',
    })
  })
})
