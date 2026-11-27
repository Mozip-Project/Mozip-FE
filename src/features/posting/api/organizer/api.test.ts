import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { resetManagedPostings } from '@/features/posting/mocks/managedPostingHandlers'
import { ORGANIZATION_POSTING_ID } from '@/features/posting/mocks/organizationPostingSamples'
import { POSTING_SAMPLE_ID } from '@/features/posting/mocks/postingDetailHandlers'
import { resetPostingDrafts } from '@/features/posting/mocks/postingDraftHandlers'
import { MANAGED_POSTING_TAB_STATUSES } from '@/features/posting/utils/managedPosting'
import { MOCK_ORGANIZATION_ID } from '@/mocks/mockOrganization'
import {
  bumpPosting,
  deletePosting,
  getManagedPosting,
  getManagedPostingSummary,
  getOrganizationPostings,
  getPostingDraft,
  publishPosting,
  savePostingDraft,
  sendNotice,
} from './api'

const { docReview: DOC_REVIEW_ID, recruiting: RECRUITING_ID } = ORGANIZATION_POSTING_ID
// 지원자 0명인 종료 공고
const CLOSED_ID = ORGANIZATION_POSTING_ID.ended
const DRAFT_ID = ORGANIZATION_POSTING_ID.draft
const NOTICE = { subject: '모집 일정 변경 안내', body: '{이름}님, 일정이 바뀌었어요.' }

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
})

afterEach(() => {
  resetManagedPostings()
  resetPostingDrafts()
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('getOrganizationPostings', () => {
  it('탭의 상태에 해당하는 공고만 조회', async () => {
    const postings = await getOrganizationPostings(
      MOCK_ORGANIZATION_ID,
      MANAGED_POSTING_TAB_STATUSES.published,
    )

    expect(postings.map(({ id, status }) => [id, status])).toEqual([
      [RECRUITING_ID, 'RECRUITING'],
      [DOC_REVIEW_ID, 'DOC_REVIEW'],
      [ORGANIZATION_POSTING_ID.interview, 'INTERVIEW'],
      [ORGANIZATION_POSTING_ID.finalResult, 'FINAL_RESULT'],
      [ORGANIZATION_POSTING_ID.noInterviewResult, 'DOC_RESULT_NOTICE'],
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
    await expect(getManagedPostingSummary(MOCK_ORGANIZATION_ID)).resolves.toMatchObject({
      upCredits: 0,
    })
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
    await expect(getManagedPostingSummary(MOCK_ORGANIZATION_ID)).resolves.toMatchObject({
      postingCounts: { published: 5, draft: 1, ended: 1 },
    })

    await expect(deletePosting(DRAFT_ID)).resolves.toBe(true)
    await expect(getManagedPostingSummary(MOCK_ORGANIZATION_ID)).resolves.toMatchObject({
      postingCounts: { published: 5, draft: 0, ended: 1 },
    })
  })

  it('작성 중이 아니면 POSTING_409', async () => {
    await expect(deletePosting(CLOSED_ID)).rejects.toMatchObject({ code: 'POSTING_409' })
  })
})

describe('getManagedPosting', () => {
  it('운영진 홈 공고는 현재 단체 id와 지원자 수를 함께 응답', async () => {
    await expect(getManagedPosting(DOC_REVIEW_ID)).resolves.toMatchObject({
      id: DOC_REVIEW_ID,
      title: 'UXUX 14기 신입 부원 모집',
      applicationCount: 48,
      organization: { id: MOCK_ORGANIZATION_ID, name: 'UXUX' },
    })
  })

  it('홈 카드와 같은 일정으로 응답, 서류 평가 중 공고는 모집 마감이 지남', async () => {
    const postings = await getOrganizationPostings(
      MOCK_ORGANIZATION_ID,
      MANAGED_POSTING_TAB_STATUSES.published,
    )
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

    expect(posting.organization.id).not.toBe(MOCK_ORGANIZATION_ID)
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
    await expect(sendNotice({ postingId: DRAFT_ID, ...NOTICE })).rejects.toMatchObject({
      code: 'MESSAGE_409',
    })
  })
})

const DAY_MS = 24 * 60 * 60 * 1000
const RECRUIT_PERIOD = {
  recruitStartAt: new Date(Date.now() - DAY_MS).toISOString(),
  recruitEndAt: new Date(Date.now() + 7 * DAY_MS).toISOString(),
}

// 게시 검사를 통과하는 통합 모집 공고
async function saveReadyPosting() {
  const { id } = await savePostingDraft({
    organizationId: MOCK_ORGANIZATION_ID,
    input: { title: 'UXUX 15기 신입 부원 모집', content: '<p>함께해요</p>', hasInterview: true },
  })
  await savePostingDraft({ organizationId: MOCK_ORGANIZATION_ID, id, input: RECRUIT_PERIOD })
  await savePostingDraft({ organizationId: MOCK_ORGANIZATION_ID, id, input: { noPosition: true } })
  await savePostingDraft({
    organizationId: MOCK_ORGANIZATION_ID,
    id,
    input: {
      questions: [
        { type: 'TEXT', title: '자기소개', required: true, maxLength: 500, sortOrder: 0 },
      ],
    },
  })
  return id
}

describe('savePostingDraft', () => {
  it('id 없이 저장하면 새 작성 중 공고를 만들고 작성 중 탭에도 추가', async () => {
    const posting = await savePostingDraft({
      organizationId: MOCK_ORGANIZATION_ID,
      input: { title: 'UXUX 15기 신입 부원 모집', hasInterview: true },
    })

    expect(posting).toMatchObject({
      status: 'DRAFT',
      hasInterview: true,
      title: 'UXUX 15기 신입 부원 모집',
    })
    const drafts = await getOrganizationPostings(
      MOCK_ORGANIZATION_ID,
      MANAGED_POSTING_TAB_STATUSES.draft,
    )
    expect(drafts.map(({ id }) => id)).toEqual([posting.id, DRAFT_ID])
  })

  it('새 공고는 제목이 없으면 COMMON_400', async () => {
    await expect(
      savePostingDraft({ organizationId: MOCK_ORGANIZATION_ID, input: { title: '  ' } }),
    ).rejects.toMatchObject({ code: 'COMMON_400' })
  })

  it('보내지 않은 값은 유지, 지울 수 있는 값은 null이면 지움', async () => {
    const { id } = await savePostingDraft({
      organizationId: MOCK_ORGANIZATION_ID,
      input: { title: '공고', region: '서울', fee: '30000' },
    })
    const posting = await savePostingDraft({
      organizationId: MOCK_ORGANIZATION_ID,
      id,
      input: { region: null },
    })

    expect(posting).toMatchObject({ title: '공고', region: null, fee: '30000' })
  })

  it('포지션을 저장하면 새 id가 생기고, 문항은 그 id로 포지션에 연결', async () => {
    const { id } = await savePostingDraft({
      organizationId: MOCK_ORGANIZATION_ID,
      input: { title: '공고' },
    })
    const { positions } = await savePostingDraft({
      organizationId: MOCK_ORGANIZATION_ID,
      id,
      input: { noPosition: false, positions: [{ name: '디자인팀', sortOrder: 0 }] },
    })
    const positionId = positions[0]?.id
    const { questions } = await savePostingDraft({
      organizationId: MOCK_ORGANIZATION_ID,
      id,
      input: {
        questions: [{ positionId, type: 'TEXT', title: '자기소개', required: true, sortOrder: 0 }],
      },
    })

    expect(questions).toMatchObject([{ position: { id: positionId }, title: '자기소개' }])
    await expect(
      savePostingDraft({
        organizationId: MOCK_ORGANIZATION_ID,
        id,
        input: {
          questions: [
            { positionId: 'gone', type: 'TEXT', title: 'Q', required: true, sortOrder: 0 },
          ],
        },
      }),
    ).rejects.toMatchObject({ code: 'COMMON_400' })
  })

  it('포지션만 다시 저장하면 기존 문항은 포지션 연결이 끊겨 공통 문항으로 남음', async () => {
    const { id } = await savePostingDraft({
      organizationId: MOCK_ORGANIZATION_ID,
      input: { title: '공고' },
    })
    const positionsInput = { noPosition: false, positions: [{ name: '디자인팀', sortOrder: 0 }] }
    const { positions } = await savePostingDraft({
      organizationId: MOCK_ORGANIZATION_ID,
      id,
      input: positionsInput,
    })
    await savePostingDraft({
      organizationId: MOCK_ORGANIZATION_ID,
      id,
      input: {
        questions: [
          { positionId: positions[0]?.id, type: 'TEXT', title: 'Q', required: true, sortOrder: 0 },
        ],
      },
    })

    const resaved = await savePostingDraft({
      organizationId: MOCK_ORGANIZATION_ID,
      id,
      input: positionsInput,
    })

    expect(resaved.positions[0]?.id).not.toBe(positions[0]?.id)
    expect(resaved.questions).toMatchObject([{ title: 'Q', position: null }])
  })

  it('운영진 홈의 작성 중 샘플을 이어서 조회', async () => {
    await expect(getPostingDraft(DRAFT_ID)).resolves.toMatchObject({
      id: DRAFT_ID,
      status: 'DRAFT',
      title: 'UXUX 15기 운영진 추가 모집',
    })
  })

  it('소속이 아닌 단체는 COMMON_403', async () => {
    await expect(
      savePostingDraft({ organizationId: '999', input: { title: '공고' } }),
    ).rejects.toMatchObject({ code: 'COMMON_403' })
  })
})

describe('publishPosting', () => {
  it('필수 값이 비어 있으면 POSTING_400과 단계별 안내', async () => {
    const { id } = await savePostingDraft({
      organizationId: MOCK_ORGANIZATION_ID,
      input: { title: '공고' },
    })

    await expect(publishPosting(id)).rejects.toMatchObject({
      code: 'POSTING_400',
      fieldErrors: [
        { field: 'basicStep', message: '기본 정보(제목, 본문)를 입력해주세요.' },
        { field: 'basicStep', message: '모집 기간을 입력해주세요.' },
        { field: 'positionsStep', message: '모집 포지션을 1개 이상 추가해주세요.' },
        { field: 'questionsStep', message: '지원서 문항을 1개 이상 추가해주세요.' },
      ],
    })
  })

  it('게시하면 진행 중 탭 맨 위, 이후 저장은 POSTING_409', async () => {
    const id = await saveReadyPosting()

    await expect(publishPosting(id)).resolves.toEqual({ id, status: 'RECRUITING' })
    const published = await getOrganizationPostings(
      MOCK_ORGANIZATION_ID,
      MANAGED_POSTING_TAB_STATUSES.published,
    )
    expect(published[0]).toMatchObject({ id, status: 'RECRUITING', bumpRank: 1 })
    await expect(
      savePostingDraft({ organizationId: MOCK_ORGANIZATION_ID, id, input: { title: '수정' } }),
    ).rejects.toMatchObject({ code: 'POSTING_409' })
    await expect(publishPosting(id)).rejects.toMatchObject({ code: 'POSTING_409' })
  })
})
