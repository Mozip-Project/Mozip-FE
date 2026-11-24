import { describe, expect, it } from 'vitest'
import type { ManagedPostingFieldsFragment, PostingStatus } from '@/gql/graphql'
import { MANAGED_POSTING_TAB_STATUSES, toManagedPosting } from './managedPosting'

const ALL_STATUSES: PostingStatus[] = [
  'DRAFT',
  'RECRUITING',
  'DOC_REVIEW',
  'DOC_RESULT_NOTICE',
  'INTERVIEW',
  'FINAL_RESULT',
  'ENDED',
]

const POSTING: ManagedPostingFieldsFragment = {
  id: '1',
  title: 'UXUX 14기 신입 부원 모집',
  status: 'RECRUITING',
  hasInterview: false,
  publishedAt: '2026-10-01T10:00:00+09:00',
  recruitEndAt: '2026-10-15T23:59:00+09:00',
  docResultConfirmedAt: null,
  docResultAt: '2026-10-18T10:00:00+09:00',
  finalResultAt: '2026-10-27T10:00:00+09:00',
  bumpRank: 18,
}

describe('MANAGED_POSTING_TAB_STATUSES', () => {
  it('서버 상태 7개를 탭 하나씩에 빠짐없이 배정', () => {
    const tabStatuses = Object.values(MANAGED_POSTING_TAB_STATUSES).flat()

    expect([...tabStatuses].sort()).toEqual([...ALL_STATUSES].sort())
  })
})

describe('toManagedPosting', () => {
  it.each<[PostingStatus, string, string]>([
    ['DRAFT', 'draft', 'posting'],
    ['RECRUITING', 'published', 'application'],
    ['DOC_REVIEW', 'published', 'documentReview'],
    ['DOC_RESULT_NOTICE', 'published', 'documentResult'],
    ['INTERVIEW', 'published', 'documentResult'],
    ['FINAL_RESULT', 'published', 'documentResult'],
    ['ENDED', 'closed', 'documentResult'],
  ])('면접 모집 %s는 %s 탭, %s 칸', (status, tab, stage) => {
    const posting = toManagedPosting({ ...POSTING, status, hasInterview: true })

    expect(posting.status).toBe(tab)
    expect(posting.progress.stage).toBe(stage)
  })

  it.each<PostingStatus>(['DOC_RESULT_NOTICE', 'FINAL_RESULT', 'ENDED'])(
    '면접 없는 모집 %s는 마지막 최종 결과 칸',
    (status) => {
      expect(toManagedPosting({ ...POSTING, status }).progress.stage).toBe('finalResult')
    },
  )

  it('지원 접수 중인 공고만 UP 가능, 순위는 서버 값 사용', () => {
    expect(toManagedPosting(POSTING)).toMatchObject({ canUp: true, latestRank: 18 })
    expect(toManagedPosting({ ...POSTING, status: 'DOC_REVIEW', bumpRank: null })).toMatchObject({
      canUp: false,
      latestRank: null,
    })
  })

  it('진행 중이 아닌 공고에는 순위·UP 정보 없음', () => {
    const posting = toManagedPosting({ ...POSTING, status: 'ENDED' })

    expect(posting).not.toHaveProperty('latestRank')
    expect(posting).not.toHaveProperty('canUp')
  })

  it('서버 시각을 한국 날짜로 바꿔 일정에 사용', () => {
    const posting = toManagedPosting({
      ...POSTING,
      // 한국 시간 10/16 00:00
      recruitEndAt: '2026-10-15T15:00:00Z',
    })

    expect(posting.progress.schedule).toEqual({
      postingCompletedAt: '2026-10-01',
      applicationDeadline: '2026-10-16',
      documentReviewCompletedAt: null,
      documentResultDate: '2026-10-18',
      finalResultDate: '2026-10-27',
    })
  })

  it('모집 일정 입력 전인 작성 중 공고는 날짜를 비워 둠', () => {
    const posting = toManagedPosting({
      ...POSTING,
      status: 'DRAFT',
      publishedAt: null,
      recruitEndAt: null,
      docResultAt: null,
      finalResultAt: null,
      bumpRank: null,
    })

    expect(posting.progress.schedule).toEqual({
      postingCompletedAt: null,
      applicationDeadline: null,
      documentReviewCompletedAt: null,
      documentResultDate: null,
      finalResultDate: null,
    })
  })
})
