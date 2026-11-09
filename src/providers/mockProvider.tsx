'use client'

import { Suspense, use, type ReactNode } from 'react'

const isMockingEnabled =
  process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_API_MOCKING === 'enabled'

let mockingReady: Promise<void> | undefined

async function startMockWorker() {
  if (typeof window !== 'undefined') {
    const { worker } = await import('@/mocks/browser')
    await worker.start({ onUnhandledFrame: 'bypass' })
  }
}

function MockingReady({ children }: { children: ReactNode }) {
  if (typeof window !== 'undefined') {
    mockingReady ??= startMockWorker().catch((error) => {
      mockingReady = undefined
      throw error
    })
    use(mockingReady)
  }
  return children
}

function MockProvider({ children }: { children: ReactNode }) {
  if (!isMockingEnabled) {
    return children
  }

  return (
    <Suspense fallback={null}>
      <MockingReady>{children}</MockingReady>
    </Suspense>
  )
}

export { MockProvider }
