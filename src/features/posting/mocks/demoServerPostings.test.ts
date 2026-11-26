import { describe, expect, it } from 'vitest'
import type { ManagedPostingFieldsFragment } from '@/gql/graphql'
import { mergeServerPostings, type ServerManagedPosting } from './demoServerPostings'

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
  it('실서버 공고를 샘플 앞에 두고, 지원 접수 중 공고는 최근 게시 순으로 1위부터 순위를 채움', () => {
    const merged = mergeServerPostings(
      [SAMPLE],
      [
        serverPosting({ id: '4', publishedAt: '2026-11-26T19:00:00+09:00' }),
        serverPosting({ id: '5', publishedAt: '2026-11-27T10:00:00+09:00' }),
        serverPosting({ id: '3', status: 'DRAFT' }),
      ],
    )

    expect(merged.map(({ id, bumpRank }) => [id, bumpRank])).toEqual([
      ['4', 2],
      ['5', 1],
      ['3', null],
      ['uxux-14-staff', 18],
    ])
  })

  it('실서버 공고가 없으면 샘플 그대로', () => {
    expect(mergeServerPostings([SAMPLE], [])).toEqual([SAMPLE])
  })
})
