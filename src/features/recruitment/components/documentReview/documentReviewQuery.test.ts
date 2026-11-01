import { describe, expect, it } from 'vitest'
import { DOCUMENT_REVIEW_POSITIONS } from '@/features/recruitment/api/organizer'
import { getDocumentReviewHref, parseDocumentReviewQuery } from './documentReviewQuery'

describe('parseDocumentReviewQuery', () => {
  it('쿼리가 없으면 전체 탭·전체 포지션·최신순·1페이지', () => {
    expect(parseDocumentReviewQuery({})).toEqual({
      status: 'all',
      positions: DOCUMENT_REVIEW_POSITIONS,
      sort: 'submittedDesc',
      keyword: '',
      page: 1,
    })
  })

  it('URL 쿼리를 조건으로 변환', () => {
    expect(
      parseDocumentReviewQuery({
        status: 'done',
        position: ['planning', 'design'],
        sort: 'nameAsc',
        q: '김',
        page: '3',
      }),
    ).toEqual({
      status: 'done',
      positions: ['design', 'planning'],
      sort: 'nameAsc',
      keyword: '김',
      page: 3,
    })
  })

  it('알 수 없는 값은 기본값으로 처리', () => {
    expect(
      parseDocumentReviewQuery({ status: 'x', position: 'x', sort: 'x', page: 'abc' }),
    ).toMatchObject({
      status: 'all',
      positions: DOCUMENT_REVIEW_POSITIONS,
      sort: 'submittedDesc',
      page: 1,
    })
  })
})

describe('getDocumentReviewHref', () => {
  it('기본값은 쿼리에서 생략', () => {
    expect(getDocumentReviewHref('1', parseDocumentReviewQuery({}))).toBe(
      '/manage/recruitments/1/documents',
    )
  })

  it('기본값이 아닌 조건만 쿼리로 유지', () => {
    const query = parseDocumentReviewQuery({ status: 'pending', position: 'design', q: '김' })

    expect(getDocumentReviewHref('1', { ...query, page: 2 })).toBe(
      '/manage/recruitments/1/documents?status=pending&position=design&q=%EA%B9%80&page=2',
    )
  })
})
