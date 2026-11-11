import { describe, expect, it } from 'vitest'
import type { PostingListQuery } from '@/features/posting/types'
import { getPostingListHref, parsePostingListQuery } from './postingListQuery'

const DEFAULT_QUERY: PostingListQuery = {
  scopes: [],
  activityTypes: [],
  activityFields: [],
  keyword: '',
  sort: 'latest',
  page: 1,
}

describe('parsePostingListQuery', () => {
  it('값이 없으면 전체 조건, 최신순, 1페이지', () => {
    expect(parsePostingListQuery({})).toEqual(DEFAULT_QUERY)
  })

  it('범위 밖 값은 버리고 옵션 순서로 정렬', () => {
    const query = parsePostingListQuery(
      new URLSearchParams('type=studentCouncil&type=unknown&type=club&scope=union'),
    )

    expect(query.activityTypes).toEqual(['club', 'studentCouncil'])
    expect(query.scopes).toEqual(['union'])
  })

  it('알 수 없는 정렬은 최신순', () => {
    expect(parsePostingListQuery({ sort: 'popular' }).sort).toBe('popular')
    expect(parsePostingListQuery({ sort: 'unknown' }).sort).toBe('latest')
  })
})

describe('getPostingListHref', () => {
  it('기본 조건은 쿼리 없는 경로', () => {
    expect(getPostingListHref('/postings', DEFAULT_QUERY)).toBe('/postings')
  })

  it('선택한 필터, 검색어, 기본값이 아닌 정렬, 페이지를 쿼리로 변환', () => {
    expect(
      getPostingListHref('/postings', {
        ...DEFAULT_QUERY,
        scopes: ['campus'],
        activityTypes: ['club', 'society'],
        keyword: 'UX',
        sort: 'deadline',
        page: 2,
      }),
    ).toBe('/postings?scope=campus&type=club&type=society&q=UX&sort=deadline&page=2')
  })

  it('검색어를 그대로 읽고 다시 같은 쿼리로 변환', () => {
    const query = parsePostingListQuery(new URLSearchParams('q=디자인 동아리'))

    expect(query.keyword).toBe('디자인 동아리')
    expect(getPostingListHref('/postings', query)).toBe(
      '/postings?q=%EB%94%94%EC%9E%90%EC%9D%B8+%EB%8F%99%EC%95%84%EB%A6%AC',
    )
  })
})
