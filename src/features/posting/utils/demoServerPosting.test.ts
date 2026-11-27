import { afterEach, describe, expect, it, vi } from 'vitest'
import { ORGANIZATION_POSTING_ID } from '@/features/posting/mocks/organizationPostingSamples'
import { POSTING_SAMPLE_ID } from '@/features/posting/mocks/postingDetailHandlers'
import { isServerPosting } from './demoServerPosting'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('isServerPosting', () => {
  it('시연 모드에서 숫자 id는 실서버 공고', () => {
    vi.stubEnv('NEXT_PUBLIC_POSTING_DEMO_MODE', 'enabled')

    expect(isServerPosting('4')).toBe(true)
    expect(isServerPosting('draft-1')).toBe(false)
  })

  it('MSW 샘플 공고 id는 실서버 공고와 겹치지 않음', () => {
    vi.stubEnv('NEXT_PUBLIC_POSTING_DEMO_MODE', 'enabled')
    const sampleIds = [
      ...Object.values(ORGANIZATION_POSTING_ID),
      ...Object.values(POSTING_SAMPLE_ID),
    ]

    expect(sampleIds.filter(isServerPosting)).toEqual([])
  })

  it('시연 모드가 아니면 모든 공고를 MSW로 처리', () => {
    vi.stubEnv('NEXT_PUBLIC_POSTING_DEMO_MODE', '')

    expect(isServerPosting('4')).toBe(false)
  })
})
