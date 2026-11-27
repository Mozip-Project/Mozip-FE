import { describe, expect, it } from 'vitest'
import type { SubmittedApplicationQuery } from '@/gql/graphql'
import { toSubmittedApplication } from './submittedApplication'

type ApplicationResponse = SubmittedApplicationQuery['application']
type PostingQuestion = ApplicationResponse['posting']['questions'][number]

function createQuestion(id: string, question: Partial<PostingQuestion> = {}): PostingQuestion {
  return {
    id,
    type: 'TEXT',
    title: id,
    description: null,
    required: true,
    maxLength: 500,
    sortOrder: 0,
    position: null,
    options: null,
    ...question,
  }
}

function createApplication(application: Partial<ApplicationResponse> = {}): ApplicationResponse {
  return {
    id: '1',
    submittedAt: '2026-10-10T14:32:00+09:00',
    availableTimes: [],
    position: { id: 'design', name: '디자인' },
    posting: { id: 'posting', title: '14기 신입부원 모집', questions: [] },
    answers: [],
    ...application,
  }
}

describe('toSubmittedApplication', () => {
  it('제목에 포지션을 붙이고 포지션 없는 모집은 공고 제목만', () => {
    expect(toSubmittedApplication(createApplication()).title).toBe('14기 신입부원 모집 · 디자인')
    expect(toSubmittedApplication(createApplication({ position: null })).title).toBe(
      '14기 신입부원 모집',
    )
  })

  it('제출 시각과 면접 가능 시간은 한국 시각으로 표시', () => {
    const application = toSubmittedApplication(
      createApplication({
        submittedAt: '2026-10-10T05:32:00Z',
        availableTimes: ['2026-10-21T13:00:00+09:00'],
      }),
    )

    expect(application.submittedAtLabel).toBe('10/10 (토) 14:32')
    expect(application.availableSlots).toEqual(['10/21 (수) 13:00'])
  })

  it('비운 문항도 카드로 만들고 공고 문항 순서대로 번호 부여', () => {
    const { questionCards } = toSubmittedApplication(
      createApplication({
        posting: {
          id: 'posting',
          title: '모집',
          questions: [
            createQuestion('links', { type: 'FILE_LINK', sortOrder: 3 }),
            createQuestion('optional', { required: false, sortOrder: 1, maxLength: null }),
            createQuestion('motivation', { sortOrder: 0 }),
            createQuestion('activity', { type: 'ACTIVITY', sortOrder: 2 }),
          ],
        },
        answers: [
          { id: 'a1', question: { id: 'motivation' }, content: '지원 동기', attachments: [] },
        ],
      }),
    )

    expect(questionCards.map(({ id, header }) => [header.number, id])).toEqual([
      [1, 'motivation'],
      [2, 'optional'],
      [3, 'activity'],
      [4, 'links'],
    ])
    expect(questionCards[0]).toMatchObject({ type: 'text', answer: '지원 동기', maxLength: 500 })
    expect(questionCards[1]).toMatchObject({ type: 'text', answer: '' })
    expect(questionCards[2]).toMatchObject({ type: 'activity', activities: [] })
    expect(questionCards[3]).toMatchObject({ type: 'fileLink', attachments: [] })
  })

  it('다른 포지션 문항과 미지원 유형은 빼고 번호를 이어서 부여', () => {
    const { questionCards } = toSubmittedApplication(
      createApplication({
        posting: {
          id: 'posting',
          title: '모집',
          questions: [
            createQuestion('common', { sortOrder: 0 }),
            createQuestion('development', { sortOrder: 1, position: { id: 'development' } }),
            createQuestion('choice', { type: 'SINGLE_CHOICE', sortOrder: 2 }),
            createQuestion('design', { sortOrder: 3, position: { id: 'design' } }),
          ],
        },
      }),
    )

    expect(questionCards.map(({ id, header }) => [header.number, id])).toEqual([
      [1, 'common'],
      [2, 'design'],
    ])
  })

  it('첨부는 파일·링크 표시 모양으로 변환', () => {
    const { questionCards } = toSubmittedApplication(
      createApplication({
        posting: {
          id: 'posting',
          title: '모집',
          questions: [createQuestion('files', { type: 'FILE_LINK' })],
        },
        answers: [
          {
            id: 'a1',
            question: { id: 'files' },
            content: null,
            attachments: [
              { id: 'f1', type: 'FILE', url: '/files/1', fileName: '포트폴리오.pdf' },
              { id: 'l1', type: 'LINK', url: 'https://example.com/work', fileName: null },
            ],
          },
        ],
      }),
    )

    expect(questionCards[0]).toMatchObject({
      attachments: [
        { id: 'f1', type: 'file', name: '포트폴리오.pdf', meta: 'PDF', href: '/files/1' },
        {
          id: 'l1',
          type: 'link',
          name: 'example.com/work',
          meta: '외부 링크',
          href: 'https://example.com/work',
        },
      ],
    })
  })
})
