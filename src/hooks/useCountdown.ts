import { useEffect, useState } from 'react'

const TICK_MS = 1000

function useCountdown() {
  const [deadline, setDeadline] = useState<number | null>(null)
  const [now, setNow] = useState(0)

  const remainingSeconds = deadline === null ? 0 : Math.max(0, Math.ceil((deadline - now) / 1000))
  const isRunning = remainingSeconds > 0
  const isExpired = deadline !== null && !isRunning

  useEffect(() => {
    if (!isRunning) {
      return
    }

    const timerId = window.setInterval(() => setNow(Date.now()), TICK_MS)

    return () => window.clearInterval(timerId)
  }, [isRunning])

  function start(durationSeconds: number) {
    const startedAt = Date.now()
    setNow(startedAt)
    setDeadline(startedAt + durationSeconds * 1000)
  }

  function stop() {
    setDeadline(null)
  }

  return { remainingSeconds, isRunning, isExpired, start, stop }
}

export { useCountdown }
