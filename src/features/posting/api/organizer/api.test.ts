import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { resetManagedPostings } from '@/features/posting/mocks/managedPostingHandlers'
import { MANAGED_POSTING_TAB_STATUSES } from '@/features/posting/utils/managedPosting'
import {
  bumpPosting,
  deletePosting,
  getManagedPostingSummary,
  getOrganizationPostings,
} from './api'

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
})

afterEach(() => {
  resetManagedPostings()
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('getOrganizationPostings', () => {
  it('탭의 상태에 해당하는 공고만 조회', async () => {
    const postings = await getOrganizationPostings('1', MANAGED_POSTING_TAB_STATUSES.published)

    expect(postings.map(({ id, status }) => [id, status])).toEqual([
      ['2', 'RECRUITING'],
      ['1', 'DOC_REVIEW'],
    ])
  })

  it('소속이 아닌 단체는 COMMON_403', async () => {
    await expect(
      getOrganizationPostings('999', MANAGED_POSTING_TAB_STATUSES.draft),
    ).rejects.toMatchObject({ code: 'COMMON_403' })
  })
})

describe('bumpPosting', () => {
  it('지원 접수 중인 공고는 1위로 올리고 잔여권 1 차감', async () => {
    await expect(bumpPosting('2')).resolves.toEqual({ id: '2', bumpRank: 1 })
    await expect(getManagedPostingSummary('1')).resolves.toMatchObject({ upCredits: 0 })
  })

  it('잔여권이 없으면 PAYMENT_402', async () => {
    await bumpPosting('2')

    await expect(bumpPosting('2')).rejects.toMatchObject({ code: 'PAYMENT_402' })
  })

  it('지원 접수 중이 아니면 POSTING_409', async () => {
    await expect(bumpPosting('1')).rejects.toMatchObject({ code: 'POSTING_409' })
  })
})

describe('deletePosting', () => {
  it('작성 중 공고를 지우면 탭 숫자에서도 빠짐', async () => {
    await expect(getManagedPostingSummary('1')).resolves.toMatchObject({
      postingCounts: { published: 2, draft: 1, ended: 1 },
    })

    await expect(deletePosting('3')).resolves.toBe(true)
    await expect(getManagedPostingSummary('1')).resolves.toMatchObject({
      postingCounts: { published: 2, draft: 0, ended: 1 },
    })
  })

  it('작성 중이 아니면 POSTING_409', async () => {
    await expect(deletePosting('4')).rejects.toMatchObject({ code: 'POSTING_409' })
  })
})
