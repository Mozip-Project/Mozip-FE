import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'
import { setMockLoggedIn } from '@/features/user/mocks/mockLogin'
import { server } from '@/mocks/server'

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' })
})

// me handler 기본값은 로그아웃이라 테스트는 로그인 상태에서 시작
beforeEach(() => {
  setMockLoggedIn(true)
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
