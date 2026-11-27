import { describe, expect, it } from 'vitest'
import type { PostingListQuery } from '@/features/posting/types'
import {
  getPostingCardPhase,
  getPostingCardPositionNames,
  getPostingListTotalPages,
  toPostingListItem,
  toPostingsVariables,
  type PostingCard,
} from './postingList'

// 한국 시각 2026-10-14 23:00
const NOW = new Date('2026-10-14T14:00:00Z')

const BASE_CARD = {
  id: 'posting-1',
  title: 'UXUX 14기 신입 부원 모집',
  organization: { name: 'UXUX', type: 'CLUB' },
  thumbnailUrl: null,
  recruitEndAt: '2026-10-15T23:59:59+09:00',
  positions: [
    { id: 'position-1', name: '기획', sortOrder: 0 },
    { id: 'position-2', name: '디자인', sortOrder: 1 },
  ],
} satisfies PostingCard

describe('getPostingCardPhase', () => {
  it('마감일까지 남은 한국 날짜 수로 모집 중 처리', () => {
    expect(getPostingCardPhase('2026-10-15T23:59:59+09:00', NOW)).toEqual({
      status: 'open',
      daysLeft: 1,
    })
  })

  it('UTC로 표기된 마감 시각도 한국 날짜 기준으로 계산', () => {
    // 한국 시각 2026-10-16 00:30
    expect(getPostingCardPhase('2026-10-15T15:30:00Z', NOW)).toEqual({
      status: 'open',
      daysLeft: 2,
    })
  })

  it('마감 당일은 0, 마감 시각이 지났어도 0으로 고정', () => {
    expect(getPostingCardPhase('2026-10-14T23:59:59+09:00', NOW)).toEqual({
      status: 'open',
      daysLeft: 0,
    })
    expect(getPostingCardPhase('2026-10-13T23:59:59+09:00', NOW)).toEqual({
      status: 'open',
      daysLeft: 0,
    })
  })
})

describe('getPostingCardPositionNames', () => {
  it('null을 빼고 sortOrder 순으로 포지션 이름만 반환', () => {
    expect(
      getPostingCardPositionNames([
        { id: 'position-2', name: '개발', sortOrder: 2 },
        null,
        { id: 'position-1', name: '기획', sortOrder: 1 },
      ]),
    ).toEqual(['기획', '개발'])
  })

  it('포지션 없는 모집은 빈 배열', () => {
    expect(getPostingCardPositionNames([])).toEqual([])
  })
})

describe('toPostingListItem', () => {
  it('카드 응답을 상세 경로·단체 유형 라벨·모집 상태·포지션 태그로 변환', () => {
    expect(toPostingListItem(BASE_CARD, NOW)).toEqual({
      id: 'posting-1',
      href: '/postings/posting-1',
      title: 'UXUX 14기 신입 부원 모집',
      organizationType: '동아리',
      organizationName: 'UXUX',
      phase: { status: 'open', daysLeft: 1 },
      tags: ['기획', '디자인'],
      thumbnailSrc: undefined,
    })
  })

  it('포지션이 없으면 태그를 비우고, 대표 이미지가 있으면 썸네일로 전달', () => {
    const item = toPostingListItem(
      {
        ...BASE_CARD,
        organization: { name: '총학생회', type: 'STUDENT_COUNCIL' },
        thumbnailUrl: 'https://example.com/thumbnail.png',
        positions: [],
      },
      NOW,
    )

    expect(item).toMatchObject({
      organizationType: '학생회',
      tags: [],
      thumbnailSrc: 'https://example.com/thumbnail.png',
    })
  })
})

describe('getPostingListTotalPages', () => {
  it('남는 공고가 있으면 한 페이지를 더 셈', () => {
    expect(getPostingListTotalPages(19, 9)).toBe(3)
  })

  it('나누어떨어지면 그대로, 공고가 없으면 0', () => {
    expect(getPostingListTotalPages(18, 9)).toBe(2)
    expect(getPostingListTotalPages(0, 9)).toBe(0)
  })
})

describe('toPostingsVariables', () => {
  const BASE_QUERY = {
    scopes: [],
    activityTypes: [],
    activityFields: [],
    keyword: '',
    sort: 'latest',
    page: 1,
  } satisfies PostingListQuery

  it('조건이 없으면 필터 값 없이 최신순 첫 페이지(서버 0부터)', () => {
    expect(toPostingsVariables(BASE_QUERY, 9)).toEqual({
      filter: { keyword: undefined, organizationTypes: undefined, fields: undefined },
      sort: 'LATEST',
      page: 0,
      size: 9,
    })
  })

  it('검색어 앞뒤 공백 제거, 활동 분야·정렬은 서버 값으로 변환', () => {
    expect(
      toPostingsVariables(
        {
          ...BASE_QUERY,
          keyword: '  디자인 ',
          activityFields: ['it', 'design'],
          sort: 'deadline',
          page: 3,
        },
        9,
      ),
    ).toEqual({
      filter: { keyword: '디자인', fields: ['IT_DEV', 'DESIGN_MEDIA'] },
      sort: 'CLOSING_SOON',
      page: 2,
      size: 9,
    })
  })

  it('연합 공고만 고르면 schoolId를 null로 보냄', () => {
    const { filter } = toPostingsVariables({ ...BASE_QUERY, scopes: ['union'] }, 9)

    expect(filter).toHaveProperty('schoolId', null)
  })

  it('교내·연합을 둘 다 고르거나 안 고르면 schoolId를 보내지 않음', () => {
    expect(
      toPostingsVariables({ ...BASE_QUERY, scopes: ['campus', 'union'] }, 9).filter,
    ).not.toHaveProperty('schoolId')
    expect(toPostingsVariables(BASE_QUERY, 9).filter).not.toHaveProperty('schoolId')
  })

  it('활동 유형은 서버 값 배열로 변환', () => {
    const { filter } = toPostingsVariables(
      { ...BASE_QUERY, activityTypes: ['club', 'studentCouncil'] },
      9,
    )

    expect(filter).toHaveProperty('organizationTypes', ['CLUB', 'STUDENT_COUNCIL'])
  })

  it('교내 공고는 아직 보내지 않음', () => {
    const { filter } = toPostingsVariables({ ...BASE_QUERY, scopes: ['campus'] }, 9)

    expect(filter).not.toHaveProperty('schoolId')
  })

  it('활동 유형·분야를 모두 고르면 보내지 않음(분야 없는 공고가 빠지지 않게)', () => {
    const { filter } = toPostingsVariables(
      {
        ...BASE_QUERY,
        activityTypes: ['club', 'society', 'studentCouncil'],
        activityFields: [
          'academic',
          'it',
          'design',
          'performance',
          'sports',
          'culture',
          'volunteer',
          'language',
          'business',
          'religion',
          'etc',
        ],
      },
      9,
    )

    expect(filter).toEqual({ keyword: undefined, organizationTypes: undefined, fields: undefined })
  })
})
