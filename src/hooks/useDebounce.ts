import { useEffect, useRef } from 'react'

const DEFAULT_DEBOUNCE_MS = 300

// 마지막 예약만 실행, 언마운트 시 대기 중인 실행 취소
function useDebounce(delayMs = DEFAULT_DEBOUNCE_MS) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  function cancel() {
    clearTimeout(timerRef.current)
  }

  function schedule(callback: () => void) {
    cancel()
    timerRef.current = setTimeout(callback, delayMs)
  }

  return { schedule, cancel }
}

export { useDebounce }
