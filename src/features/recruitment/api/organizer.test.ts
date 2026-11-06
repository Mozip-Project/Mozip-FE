import { describe, expect, it } from 'vitest'
import {
  DOCUMENT_REVIEW_POSITIONS,
  type DocumentResultQuery,
  type DocumentReviewQuery,
} from '@/features/recruitment/types'
import {
  confirmDocumentResults,
  getDocumentResultApplicants,
  getDocumentResultOverview,
  getDocumentReviewApplicants,
  updateDocumentResult,
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
  it('조건이 없으면 기본 탭 숫자와 첫 페이지 10명을 반환', async () => {
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

const RESULT_QUERY = {
  status: 'all',
  positions: DOCUMENT_REVIEW_POSITIONS,
  sort: 'rankDesc',
  keyword: '',
  page: 1,
} satisfies DocumentResultQuery

describe('getDocumentResultApplicants', () => {
  it('조건이 없으면 점수 높은순 첫 페이지와 결과별 탭 숫자를 반환', async () => {
    const result = await getDocumentResultApplicants('1', RESULT_QUERY)

    expect(result.statusCounts).toEqual({ all: 48, pass: 16, hold: 4, fail: 28 })
    expect(result.totalResultCounts).toEqual({ pass: 16, hold: 4, fail: 28 })
    expect(result.totalPages).toBe(5)
    expect(result.applicants.slice(0, 3).map(({ rank, name }) => [rank, name])).toEqual([
      [1, '정세나'],
      [2, '이지원'],
      [3, '김모집'],
    ])
  })

  it('점수 없는 공고는 합격 의견 많은순으로 순위를 매기고 동점은 같은 순위', async () => {
    const result = await getDocumentResultApplicants('2', RESULT_QUERY)

    expect(result.hasScore).toBe(false)
    expect(result.applicants.every(({ averageScore }) => averageScore === null)).toBe(true)
    expect(result.applicants.slice(0, 3).map(({ rank, name }) => [rank, name])).toEqual([
      [1, '이지원'],
      [1, '정세나'],
      [3, '구민서'],
    ])
  })

  it('필터와 검색은 탭 숫자에만 반영하고 전체 보류 인원은 유지', async () => {
    const result = await getDocumentResultApplicants('1', { ...RESULT_QUERY, keyword: '정세나' })

    expect(result.statusCounts).toEqual({ all: 1, pass: 1, hold: 0, fail: 0 })
    expect(result.totalResultCounts).toEqual({ pass: 16, hold: 4, fail: 28 })
  })

  it('변경한 최종 결과를 다음 조회에 반영', async () => {
    await updateDocumentResult('1', '4', 'pass')
    const result = await getDocumentResultApplicants('1', { ...RESULT_QUERY, status: 'hold' })

    expect(result.applicants.map(({ name }) => name)).not.toContain('한결')
    expect(result.totalResultCounts.hold).toBe(3)

    await updateDocumentResult('1', '4', 'hold')
  })
})

describe('getDocumentResultOverview', () => {
  it('확정 전에는 확정 시각이 없고 확정 후 공고별로 기록', async () => {
    expect((await getDocumentResultOverview('8')).confirmedAt).toBeNull()

    await confirmDocumentResults('8')

    expect((await getDocumentResultOverview('8')).confirmedAt).not.toBeNull()
    expect((await getDocumentResultOverview('7')).confirmedAt).toBeNull()
  })

  it('면접 없는 공고 구분', async () => {
    expect((await getDocumentResultOverview('1')).hasInterview).toBe(true)
    expect((await getDocumentResultOverview('3')).hasInterview).toBe(false)
  })
})
