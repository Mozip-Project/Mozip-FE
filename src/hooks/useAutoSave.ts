import { useEffect, useRef } from 'react'
import { useDebounce } from './useDebounce'

type SaveTrigger = 'auto' | 'manual'

// 입력을 멈춘 뒤 저장, 저장 중 다시 요청되면 끝난 뒤 한 번 더 저장해 늦은 응답이 최신 저장을 덮지 않도록 처리
function useAutoSave(delayMs: number, onSave: (trigger: SaveTrigger) => Promise<void>) {
  const debounce = useDebounce(delayMs)
  const onSaveRef = useRef(onSave)
  // 진행 중인 저장, 끝나면 null
  const savingRef = useRef<Promise<void> | null>(null)
  // 저장 중 들어온 요청, 수동 저장이 하나라도 있으면 수동으로 처리
  const queuedTriggerRef = useRef<SaveTrigger | null>(null)

  useEffect(() => {
    onSaveRef.current = onSave
  })

  // 화면을 떠난 뒤 이전 화면 값으로 저장하지 않도록 대기 중인 저장 취소
  useEffect(
    () => () => {
      queuedTriggerRef.current = null
    },
    [],
  )

  async function saveUntilQueueEmpty(trigger: SaveTrigger) {
    let nextTrigger: SaveTrigger | null = trigger
    while (nextTrigger) {
      queuedTriggerRef.current = null
      await onSaveRef.current(nextTrigger)
      nextTrigger = queuedTriggerRef.current
    }
  }

  async function save(trigger: SaveTrigger) {
    if (savingRef.current) {
      queuedTriggerRef.current = queuedTriggerRef.current === 'manual' ? 'manual' : trigger
      return
    }

    const saving = saveUntilQueueEmpty(trigger)
    savingRef.current = saving
    try {
      await saving
    } finally {
      savingRef.current = null
    }
  }

  function scheduleSave() {
    debounce.schedule(() => void save('auto'))
  }

  function saveNow() {
    debounce.cancel()
    return save('manual')
  }

  // 이미 보낸 저장은 되돌릴 수 없어 대기 중인 저장만 취소
  function cancelScheduledSave() {
    debounce.cancel()
    queuedTriggerRef.current = null
  }

  // 이미 보낸 저장이 끝날 때까지 대기, 저장 실패는 onSave 쪽 처리라 여기선 대기만 끝냄
  function waitForSave() {
    return savingRef.current?.catch(() => undefined) ?? Promise.resolve()
  }

  return { scheduleSave, saveNow, cancelScheduledSave, waitForSave }
}

export { useAutoSave }
export type { SaveTrigger }
