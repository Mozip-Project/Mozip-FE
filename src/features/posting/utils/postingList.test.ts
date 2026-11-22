import { describe, expect, it } from 'vitest'
import {
  getPostingCardPhase,
  getPostingCardPositionNames,
  getPostingListTotalPages,
  toPostingListItem,
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
