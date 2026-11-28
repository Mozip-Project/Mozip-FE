import { GraphQLError } from 'graphql'
import { ClientError } from 'graphql-request'
import { describe, expect, it } from 'vitest'
import type { ManagedPostingFieldsFragment, PostingsQuery } from '@/gql/graphql'
import {
  EMPTY_POSTING_PAGE,
  mergeServerPostingPage,
  mergeServerPostings,
  toServerErrorBody,
  type ServerManagedPosting,
} from './demoServerPostings'

function serverPosting(
  overrides: Partial<ServerManagedPosting> & Pick<ServerManagedPosting, 'id'>,
): ServerManagedPosting {
  return {
    title: `공고 ${overrides.id}`,
    status: 'RECRUITING',
    hasInterview: false,
    publishedAt: null,
    recruitEndAt: null,
    docResultConfirmedAt: null,
    docResultAt: null,
    finalResultAt: null,
    ...overrides,
  }
}

const SAMPLE: ManagedPostingFieldsFragment = {
  ...serverPosting({ id: 'uxux-14-staff', publishedAt: '2026-10-01T00:00:00+09:00' }),
  bumpRank: 18,
}

describe('mergeServerPostings', () => {
  it('샘플을 실서버 공고 앞에 두고, 지원 접수 중 공고는 최근 게시 순으로 1위부터 순위를 채움', () => {
    const merged = mergeServerPostings(
      [SAMPLE],
      [
        serverPosting({ id: '4', publishedAt: '2026-11-26T19:00:00+09:00' }),
        serverPosting({ id: '5', publishedAt: '2026-11-27T10:00:00+09:00' }),
        serverPosting({ id: '3', status: 'DRAFT' }),
      ],
    )

    expect(merged.map(({ id, bumpRank }) => [id, bumpRank])).toEqual([
      ['uxux-14-staff', 18],
      ['4', 2],
      ['5', 1],
      ['3', null],
    ])
  })

  it('실서버 공고가 없으면 샘플 그대로', () => {
    expect(mergeServerPostings([SAMPLE], [])).toEqual([SAMPLE])
  })
})

describe('mergeServerPostingPage', () => {
  type Card = PostingsQuery['postings']['items'][number]

  function cards(prefix: string, count: number): Card[] {
    return Array.from({ length: count }, (_, index) => ({
      id: `${prefix}-${index + 1}`,
      title: `${prefix} ${index + 1}`,
      organization: { name: '단체', type: 'CLUB' },
      positions: [],
      thumbnailUrl: null,
      recruitEndAt: '2026-12-31T23:59:59+09:00',
    }))
  }

  const SERVER = cards('server', 5)
  const SAMPLES = cards('sample', 4)
  const SIZE = 2

  // 서버가 같은 page·size로 자른 응답
  function mergePage(page: number) {
    const serverPage = {
      totalCount: SERVER.length,
      items: SERVER.slice(page * SIZE, (page + 1) * SIZE),
    }
    return mergeServerPostingPage(serverPage, SAMPLES, page, SIZE)
  }

  it('실서버 공고를 모두 보여 준 뒤 샘플을 이어서 채우고, 페이지마다 size개', () => {
    const pages = [0, 1, 2, 3, 4].map((page) => mergePage(page).items.map(({ id }) => id))

    expect(pages).toEqual([
      ['server-1', 'server-2'],
      ['server-3', 'server-4'],
      ['server-5', 'sample-1'],
      ['sample-2', 'sample-3'],
      ['sample-4'],
    ])
    expect(mergePage(0).totalCount).toBe(9)
  })

  it('실서버 조회가 비면 샘플만 페이지대로', () => {
    const merged = mergeServerPostingPage(EMPTY_POSTING_PAGE, SAMPLES, 1, SIZE)

    expect(merged.items.map(({ id }) => id)).toEqual(['sample-3', 'sample-4'])
    expect(merged.totalCount).toBe(4)
  })
})

describe('toServerErrorBody', () => {
  it('서버 오류는 코드를 그대로 전달', () => {
    const error = new ClientError(
      {
        errors: [
          new GraphQLError('공고를 찾을 수 없습니다.', { extensions: { code: 'POSTING_404' } }),
        ],
        status: 200,
        headers: new Headers(),
        body: '',
      },
      { query: '' },
    )

    expect(toServerErrorBody(error)).toEqual({
      errors: [{ message: '공고를 찾을 수 없습니다.', extensions: { code: 'POSTING_404' } }],
      data: null,
    })
  })

  it('네트워크 실패는 COMMON_500', () => {
    expect(toServerErrorBody(new TypeError('fetch failed')).errors[0]?.extensions).toEqual({
      code: 'COMMON_500',
    })
  })
})
