'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import {
  describeElement,
  getScenarioClick,
  getScenarioDropAction,
} from '@/features/analytics/utils/scenarioClick'
import { getActionLabel, getStepLabel } from '@/features/analytics/utils/scenarioLabel'
import { getScenarioStep, type ScenarioStep } from '@/features/analytics/utils/scenarioStep'
import { initAnalytics, resetVisitor, track } from '@/lib/analytics'

// 한 노트북에서 여러 명이 시연해 시작 버튼마다 새 방문자로 기록
const NEW_VISITOR_ACTION = 'home_new_posting'

// capture 단계에서 등록해 화면 안에서 전파를 막아도 기록
const LISTENER_OPTIONS = { capture: true }

type ScenarioClickState = {
  step: ScenarioStep | null
  // 단계 진입 또는 직전 정답 시각
  startedAt: number
  misclickCount: number
  // 정답 요소를 끌기 시작했을 때만 놓는 곳을 정답으로 기록
  isDraggingTarget: boolean
}

function stepProperties(step: ScenarioStep) {
  return { step, step_label: getStepLabel(step) }
}

// 시연 시나리오 단계 진입·정답 클릭·오클릭을 Mixpanel로 기록, 화면은 그리지 않음
function ScenarioTracker() {
  const pathname = usePathname()
  const step = getScenarioStep(pathname, useSearchParams().get('step'))
  const stateRef = useRef<ScenarioClickState>({
    step: null,
    startedAt: 0,
    misclickCount: 0,
    isDraggingTarget: false,
  })

  useEffect(() => {
    initAnalytics()
  }, [])

  useEffect(() => {
    stateRef.current = {
      step,
      startedAt: performance.now(),
      misclickCount: 0,
      isDraggingTarget: false,
    }
    if (step) {
      track('scenario_step_viewed', stepProperties(step))
    }
  }, [step])

  useEffect(() => {
    function recordAction(action: string) {
      const state = stateRef.current

      if (!state.step) {
        return
      }
      if (action === NEW_VISITOR_ACTION) {
        resetVisitor()
      }
      const now = performance.now()
      track('scenario_action', {
        ...stepProperties(state.step),
        action,
        action_label: getActionLabel(action),
        time_to_click_ms: Math.round(now - state.startedAt),
        misclicks_before: state.misclickCount,
        is_first_click_success: state.misclickCount === 0,
      })
      stateRef.current = { ...state, startedAt: now, misclickCount: 0 }
    }

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
        track('scenario_misclick', {
          ...stepProperties(state.step),
          element: describeElement(event.target),
        })
        return
      }
      recordAction(click.action)
    }

    // 드래그는 클릭이 발생하지 않아 집을 때와 놓을 때를 따로 기록
    function handleDragStart(event: DragEvent) {
      if (!(event.target instanceof Element)) {
        return
      }
      const click = getScenarioClick(event.target)

      stateRef.current.isDraggingTarget = click.type === 'target'
      if (click.type === 'target') {
        recordAction(click.action)
      }
    }

    function handleDrop(event: DragEvent) {
      const isDraggingTarget = stateRef.current.isDraggingTarget
      stateRef.current.isDraggingTarget = false

      if (!isDraggingTarget || !(event.target instanceof Element)) {
        return
      }
      const action = getScenarioDropAction(event.target)

      if (action) {
        recordAction(action)
      }
    }

    document.addEventListener('click', handleClick, LISTENER_OPTIONS)
    document.addEventListener('dragstart', handleDragStart, LISTENER_OPTIONS)
    document.addEventListener('drop', handleDrop, LISTENER_OPTIONS)
    return () => {
      document.removeEventListener('click', handleClick, LISTENER_OPTIONS)
      document.removeEventListener('dragstart', handleDragStart, LISTENER_OPTIONS)
      document.removeEventListener('drop', handleDrop, LISTENER_OPTIONS)
    }
  }, [])

  return null
}

export { ScenarioTracker }
