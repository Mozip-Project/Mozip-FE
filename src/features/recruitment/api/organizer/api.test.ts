import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { ORGANIZATION_POSTING_ID } from '@/features/posting/mocks/organizationPostingSamples'
import { getDocEvaluationApplications, getRecruitmentPosting } from './api'

const POSTING_ID = ORGANIZATION_POSTING_ID.docReview

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('서류 평가 목록 API (MSW)', () => {
  it('공고 정보와 최신순 10명, 내 평가 상태를 조회', async () => {
    expect(await getRecruitmentPosting(POSTING_ID)).toMatchObject({
      id: POSTING_ID,
      noPosition: false,
      docResultConfirmedAt: null,
    })
    const result = await getDocEvaluationApplications({ postingId: POSTING_ID })

    expect(result).toMatchObject({
      totalCount: 48,
      page: 1,
      totalPages: 5,
      tabCounts: { all: 48, notEvaluated: 16, evaluated: 32 },
    })
    expect(result.rows).toHaveLength(10)
    expect(
      result.rows
        .slice(0, 3)
        .map(({ application, myEvaluationStatus }) => [application.user.name, myEvaluationStatus]),
    ).toEqual([
      ['한가람', 'NONE'],
      ['윤서진', 'SAVED'],
      ['오하늘', 'DRAFT'],
    ])
  })

  it('임시저장은 평가 전에 포함하고 저장한 평가만 평가 완료로 분류', async () => {
    const pending = await getDocEvaluationApplications({
      postingId: POSTING_ID,
      tab: 'NOT_EVALUATED',
    })
    const done = await getDocEvaluationApplications({ postingId: POSTING_ID, tab: 'EVALUATED' })

    expect(pending.totalCount).toBe(16)
    expect(pending.rows.some(({ myEvaluationStatus }) => myEvaluationStatus === 'DRAFT')).toBe(true)
    expect(pending.rows.every(({ myEvaluationStatus }) => myEvaluationStatus !== 'SAVED')).toBe(
      true,
    )
    expect(done.totalCount).toBe(32)
    expect(done.rows.every(({ myEvaluationStatus }) => myEvaluationStatus === 'SAVED')).toBe(true)
    expect(pending.tabCounts).toEqual(done.tabCounts)
  })

  it('포지션 숫자는 검색어만, 탭 숫자는 검색어와 포지션 필터를 적용', async () => {
    const result = await getDocEvaluationApplications({
      postingId: POSTING_ID,
      tab: 'NOT_EVALUATED',
      positionIds: ['planning'],
      keyword: '윤',
    })

    expect(result.rows).toEqual([])
    expect(result.totalCount).toBe(0)
    expect(result.totalPages).toBe(0)
    expect(result.tabCounts).toEqual({ all: 1, notEvaluated: 0, evaluated: 1 })
    expect(result.positionCounts.map(({ position, count }) => [position.id, count])).toEqual([
      ['design', 2],
      ['development', 3],
      ['planning', 1],
    ])
  })

  it('포지션 다중 선택과 이름 정렬을 적용', async () => {
    const result = await getDocEvaluationApplications({
      postingId: POSTING_ID,
      positionIds: ['design', 'planning'],
      sort: 'NAME_ASC',
    })

    expect(result.totalCount).toBe(26)
    expect(
      result.rows.every(({ application }) =>
        ['디자인', '기획'].includes(application.position?.name ?? ''),
      ),
    ).toBe(true)
    const names = result.rows.map(({ application }) => application.user.name)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'ko')))
    expect(result.positionCounts.map(({ count }) => count)).toEqual([20, 22, 6])
  })

  it('null·빈 포지션 목록은 전체, 페이지는 1부터 10행씩 조회', async () => {
    const all = await getDocEvaluationApplications({ postingId: POSTING_ID, positionIds: null })
    const empty = await getDocEvaluationApplications({ postingId: POSTING_ID, positionIds: [] })
    const last = await getDocEvaluationApplications({ postingId: POSTING_ID, page: 5 })

    expect(empty).toEqual(all)
    expect(last.page).toBe(5)
    expect(last.rows).toHaveLength(8)
    expect(last.rows[0]?.application.id).toBe('41')
  })

  it('파트 없는 모집은 포지션 숫자 없이 지원자를 반환', async () => {
    const postingId = ORGANIZATION_POSTING_ID.noInterviewResult
    expect(await getRecruitmentPosting(postingId)).toMatchObject({ noPosition: true })
    const result = await getDocEvaluationApplications({ postingId })

    expect(result.totalCount).toBe(18)
    expect(result.positionCounts).toEqual([])
    expect(result.rows.every(({ application }) => application.position === null)).toBe(true)
  })

  it('지원자가 없는 공고는 페이지 번호 없이 빈 목록 반환', async () => {
    expect(
      await getDocEvaluationApplications({ postingId: ORGANIZATION_POSTING_ID.ended }),
    ).toMatchObject({ rows: [], totalCount: 0, totalPages: 0 })
  })

  it('없는 공고와 1 미만 페이지는 오류 반환', async () => {
    await expect(getDocEvaluationApplications({ postingId: 'missing' })).rejects.toMatchObject({
      code: 'POSTING_404',
    })
    await expect(getRecruitmentPosting('missing')).rejects.toMatchObject({ code: 'POSTING_404' })
    await expect(
      getDocEvaluationApplications({ postingId: POSTING_ID, page: 0 }),
    ).rejects.toMatchObject({ code: 'COMMON_400' })
  })
})
