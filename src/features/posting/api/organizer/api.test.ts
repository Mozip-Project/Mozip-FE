import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { resetManagedPostings } from '@/features/posting/mocks/managedPostingHandlers'
import { POSTING_SAMPLE_ID } from '@/features/posting/mocks/postingDetailHandlers'
import { MANAGED_POSTING_TAB_STATUSES } from '@/features/posting/utils/managedPosting'
import {
  bumpPosting,
  deletePosting,
  getManagedPosting,
  getManagedPostingSummary,
  getOrganizationPostings,
  sendNotice,
} from './api'

const { open: DOC_REVIEW_ID, staff: RECRUITING_ID } = POSTING_SAMPLE_ID
// 지원자 0명인 종료 공고
const CLOSED_ID = '4'
const NOTICE = { subject: '모집 일정 변경 안내', body: '{이름}님, 일정이 바뀌었어요.' }

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
      [RECRUITING_ID, 'RECRUITING'],
      [DOC_REVIEW_ID, 'DOC_REVIEW'],
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
    await expect(bumpPosting(RECRUITING_ID)).resolves.toEqual({ id: RECRUITING_ID, bumpRank: 1 })
    await expect(getManagedPostingSummary('1')).resolves.toMatchObject({ upCredits: 0 })
  })

  it('잔여권이 없으면 PAYMENT_402', async () => {
    await bumpPosting(RECRUITING_ID)

    await expect(bumpPosting(RECRUITING_ID)).rejects.toMatchObject({ code: 'PAYMENT_402' })
  })

  it('지원 접수 중이 아니면 POSTING_409', async () => {
    await expect(bumpPosting(DOC_REVIEW_ID)).rejects.toMatchObject({ code: 'POSTING_409' })
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

describe('getManagedPosting', () => {
  it('운영진 홈 공고는 현재 단체 id와 지원자 수를 함께 응답', async () => {
    await expect(getManagedPosting(DOC_REVIEW_ID)).resolves.toMatchObject({
      id: DOC_REVIEW_ID,
      title: 'UXUX 14기 신입 부원 모집',
      applicationCount: 24,
      organization: { id: '1', name: 'UXUX' },
    })
  })

  it('홈 카드와 같은 일정으로 응답, 서류 평가 중 공고는 모집 마감이 지남', async () => {
    const postings = await getOrganizationPostings('1', MANAGED_POSTING_TAB_STATUSES.published)
    const card = postings.find(({ id }) => id === DOC_REVIEW_ID)
    const posting = await getManagedPosting(DOC_REVIEW_ID)

    expect(posting).toMatchObject({
      recruitEndAt: card?.recruitEndAt,
      docResultAt: card?.docResultAt,
      finalResultAt: card?.finalResultAt,
    })
    expect(Date.parse(posting.recruitEndAt ?? '')).toBeLessThan(Date.now())
  })

  it('운영진 홈에 없는 공고는 다른 단체 공고로 응답', async () => {
    const posting = await getManagedPosting(POSTING_SAMPLE_ID.direct)

    expect(posting.organization.id).not.toBe('1')
  })

  it('없는 공고는 POSTING_404', async () => {
    await expect(getManagedPosting('999')).rejects.toMatchObject({ code: 'POSTING_404' })
  })
})

describe('sendNotice', () => {
  it('지원자가 있는 공고는 발송한 공지 id 응답', async () => {
    const notice = await sendNotice({ postingId: DOC_REVIEW_ID, ...NOTICE })

    expect(notice.id).toBeTruthy()
  })

  it('제목이 100자를 넘으면 COMMON_400과 입력별 메시지', async () => {
    await expect(
      sendNotice({ postingId: DOC_REVIEW_ID, ...NOTICE, subject: 'a'.repeat(101) }),
    ).rejects.toMatchObject({ code: 'COMMON_400', fieldErrors: [{ field: 'subject' }] })
  })

  it('제출 지원자가 없으면 MESSAGE_422', async () => {
    await expect(sendNotice({ postingId: CLOSED_ID, ...NOTICE })).rejects.toMatchObject({
      code: 'MESSAGE_422',
    })
  })

  it('작성 중 공고는 MESSAGE_409', async () => {
    await expect(sendNotice({ postingId: '3', ...NOTICE })).rejects.toMatchObject({
      code: 'MESSAGE_409',
    })
  })
})
