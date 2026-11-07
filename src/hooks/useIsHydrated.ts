import { useSyncExternalStore } from 'react'

const subscribeNothing = () => () => undefined

function useIsHydrated() {
  return useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  )
}

export { useIsHydrated }
