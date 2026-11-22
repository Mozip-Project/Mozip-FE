'use client'

import { Suspense, use, type ReactNode } from 'react'

// 백엔드 배포 전 배포 환경에서도 확인하도록 NODE_ENV와 관계없이 이 값 하나로 켜고 끔
const isMockingEnabled = process.env.NEXT_PUBLIC_API_MOCKING === 'enabled'

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
