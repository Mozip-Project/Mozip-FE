import { describe, expect, it } from 'vitest'
import { DOCUMENT_REVIEW_POSITIONS, type DocumentResultQuery } from '@/features/recruitment/types'
import {
  confirmDocumentResults,
  getDocumentResultApplicants,
  getDocumentResultOverview,
  updateDocumentResult,
} from './organizer'

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

  it('평균 점수가 같으면 같은 순위', async () => {
    const result = await getDocumentResultApplicants('1', RESULT_QUERY)

    expect(
      result.applicants.slice(7).map(({ rank, averageScore }) => [rank, averageScore]),
    ).toEqual([
      [8, 1.8],
      [9, 1.7],
      [9, 1.7],
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

  it('결과 변경은 해당 공고에만 반영', async () => {
    await updateDocumentResult('6', '4', 'pass')
    const otherPosting = await getDocumentResultApplicants('7', { ...RESULT_QUERY, status: 'hold' })

    expect(otherPosting.applicants.map(({ name }) => name)).toContain('한결')
    expect(otherPosting.totalResultCounts.hold).toBe(4)
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
