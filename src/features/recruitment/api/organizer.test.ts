import { describe, expect, it } from 'vitest'
import {
  DOCUMENT_REVIEW_POSITIONS,
  canEditDocumentReview,
  getDocumentReviewApplicants,
  type DocumentReviewQuery,
} from './organizer'

const BASE_QUERY = {
  status: 'all',
  positions: DOCUMENT_REVIEW_POSITIONS,
  sort: 'submittedDesc',
  keyword: '',
  page: 1,
} satisfies DocumentReviewQuery

function getPage(change: Partial<DocumentReviewQuery>) {
  return getDocumentReviewApplicants('1', { ...BASE_QUERY, ...change })
}

describe('getDocumentReviewApplicants', () => {
  it('조건이 없으면 Figma 기준 탭 숫자와 첫 페이지 10명을 반환', async () => {
    const result = await getPage({})

    expect(result.statusCounts).toEqual({ all: 48, pending: 16, done: 32 })
    expect(result.totalPages).toBe(5)
    expect(result.applicants.map((applicant) => applicant.name)).toEqual([
      '한가람',
      '윤서진',
      '오하늘',
      '정세나',
      '강민준',
      '서지우',
      '최두리',
      '임채원',
      '박하나',
      '송유진',
    ])
  })

  it('탭 숫자는 포지션 필터와 검색어를 적용한 결과 기준', async () => {
    const result = await getPage({ positions: ['planning'], keyword: '윤' })

    expect(result.statusCounts).toEqual({ all: 1, pending: 0, done: 1 })
    expect(result.applicants.map((applicant) => applicant.name)).toEqual(['윤서진'])
  })

  it('탭과 포지션 필터, 검색어를 모두 만족하는 지원자만 표시', async () => {
    const result = await getPage({ status: 'pending', positions: ['design'] })

    expect(result.applicants.length).toBeGreaterThan(0)
    expect(
      result.applicants.every(
        (applicant) => !applicant.isEvaluated && applicant.position === 'design',
      ),
    ).toBe(true)
  })

  it('평가 전 탭은 내 평가 전, 평가 완료 탭은 내 평가 완료 지원자만 표시', async () => {
    const pending = await getPage({ status: 'pending', page: 2 })
    const done = await getPage({ status: 'done', page: 4 })

    expect(pending.applicants).toHaveLength(6)
    expect(pending.applicants.every((applicant) => !applicant.isEvaluated)).toBe(true)
    expect(done.applicants).toHaveLength(2)
    expect(done.applicants.every((applicant) => applicant.isEvaluated)).toBe(true)
  })

  it('포지션 메뉴 숫자는 포지션 선택과 무관하게 탭·검색 결과 기준', async () => {
    const result = await getPage({ status: 'all', positions: ['planning'] })

    expect(result.positionCounts).toEqual({ design: 20, development: 22, planning: 6 })
  })

  it('범위 밖 페이지는 마지막 페이지로, 결과가 없으면 1페이지로 처리', async () => {
    const lastPage = await getPage({ page: 99 })
    const empty = await getPage({ keyword: '없는이름' })

    expect(lastPage.currentPage).toBe(5)
    expect(lastPage.applicants).toHaveLength(8)
    expect(empty).toMatchObject({ applicants: [], currentPage: 1, totalPages: 0 })
  })
})

describe('canEditDocumentReview', () => {
  const DEADLINE = '2026-10-23T23:59:59+09:00'

  it('마감 전에는 평가 수정 가능', () => {
    expect(canEditDocumentReview(DEADLINE, new Date('2026-10-23T23:59:58+09:00'))).toBe(true)
  })

  it('마감 시각부터는 평가 수정 불가', () => {
    expect(canEditDocumentReview(DEADLINE, new Date('2026-10-23T23:59:59+09:00'))).toBe(false)
    expect(canEditDocumentReview(DEADLINE, new Date('2026-10-24T00:00:00+09:00'))).toBe(false)
  })

  it('마감 시각 형식을 알 수 없으면 수정 불가로 처리', () => {
    expect(canEditDocumentReview('미정', new Date('2026-10-01T00:00:00+09:00'))).toBe(false)
  })
})
