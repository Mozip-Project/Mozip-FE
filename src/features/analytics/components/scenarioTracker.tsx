'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { describeElement, getScenarioClick } from '@/features/analytics/utils/scenarioClick'
import { getScenarioStep, type ScenarioStep } from '@/features/analytics/utils/scenarioStep'
import { initAnalytics, resetVisitor, track } from '@/lib/analytics'

// 한 노트북에서 여러 명이 시연해 시작 버튼마다 새 방문자로 기록
const NEW_VISITOR_ACTION = 'home_new_posting'

type ScenarioClickState = {
  step: ScenarioStep | null
  // 단계 진입 또는 직전 정답 클릭 시각
  startedAt: number
  misclickCount: number
}

// 시연 시나리오 단계 진입·정답 클릭·오클릭을 Mixpanel로 기록, 화면은 그리지 않음
function ScenarioTracker() {
  const pathname = usePathname()
  const step = getScenarioStep(pathname, useSearchParams().get('step'))
  const stateRef = useRef<ScenarioClickState>({ step: null, startedAt: 0, misclickCount: 0 })

  useEffect(() => {
    initAnalytics()
  }, [])

  useEffect(() => {
    stateRef.current = { step, startedAt: performance.now(), misclickCount: 0 }
    if (step) {
      track('scenario_step_viewed', { step })
    }
  }, [step])

  useEffect(() => {
    // 화면 안에서 전파를 막는 클릭도 잡도록 capture 단계에서 등록
    function handleClick(event: MouseEvent) {
      const state = stateRef.current

      if (!state.step || !(event.target instanceof Element)) {
        return
      }
      const click = getScenarioClick(event.target)

      if (click.type === 'ignored') {
        return
      }
      if (click.type === 'miss') {
        state.misclickCount += 1
        track('scenario_misclick', { step: state.step, element: describeElement(event.target) })
        return
      }
      if (click.action === NEW_VISITOR_ACTION) {
        resetVisitor()
      }
      const now = performance.now()
      track('scenario_action', {
        step: state.step,
        action: click.action,
        time_to_click_ms: Math.round(now - state.startedAt),
        misclicks_before: state.misclickCount,
        is_first_click_success: state.misclickCount === 0,
      })
      stateRef.current = { ...state, startedAt: now, misclickCount: 0 }
    }

    document.addEventListener('click', handleClick, { capture: true })
    return () => document.removeEventListener('click', handleClick, { capture: true })
  }, [])

  return null
}

export { ScenarioTracker }
