import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { ORGANIZATION_POSTING_ID } from '@/features/posting/mocks/organizationPostingSamples'
import type { DocEvaluationApplicationDetailQuery, PostingQuestionsQuery } from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { server } from '@/mocks/server'
import { useDocumentEvaluationApplication } from './useDocumentEvaluationApplication'
import type { PropsWithChildren } from 'react'

const POSTING_ID = ORGANIZATION_POSTING_ID.docReview

type ApplicationDetail = DocEvaluationApplicationDetailQuery['application']
type DetailAnswer = ApplicationDetail['answers'][number]
type PostingQuestion = PostingQuestionsQuery['posting']['questions'][number]

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
})

afterAll(() => {
  vi.unstubAllEnvs()
})

function renderApplication(applicationId: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  return renderHook(() => useDocumentEvaluationApplication(POSTING_ID, applicationId), {
    wrapper: Wrapper,
  })
}

function createAnswer(
  id: string,
  question: Partial<DetailAnswer['question']>,
  answer: Partial<Pick<DetailAnswer, 'content' | 'attachments'>> = {},
): DetailAnswer {
  return {
    id,
    question: {
      id: `question-${id}`,
      type: 'TEXT',
      title: id,
      description: null,
      required: true,
      maxLength: 300,
      sortOrder: 0,
      options: null,
      ...question,
    },
    content: null,
    attachments: [],
    ...answer,
  }
}

function createPostingQuestion(
  id: string,
  question: Partial<PostingQuestion> = {},
): PostingQuestion {
  return {
    id,
    type: 'TEXT',
    title: id,
    description: null,
    required: true,
    maxLength: 300,
    sortOrder: 0,
    position: null,
    options: null,
    ...question,
  }
}

type ResponseOptions = {
  profileSnapshot?: unknown
  position?: ApplicationDetail['position']
  // 기본은 답한 문항 전부가 공통 문항
  postingQuestions?: PostingQuestion[]
}

function respondWithAnswers(
  answers: DetailAnswer[],
  {
    profileSnapshot = null,
    position = null,
    postingQuestions = answers.map(({ question }) => ({ ...question, position: null })),
  }: ResponseOptions = {},
) {
  server.use(
    graphqlApi.query<DocEvaluationApplicationDetailQuery>('DocEvaluationApplicationDetail', () =>
      HttpResponse.json({
        data: {
          application: {
            id: 'application-1',
            user: { name: '정세나' },
            position,
            profileSnapshot,
            availableTimes: ['2026-10-21T13:00:00+09:00'],
            answers,
          },
        },
      }),
    ),
    graphqlApi.query<PostingQuestionsQuery>('PostingQuestions', () =>
      HttpResponse.json({
        data: {
          posting: {
            id: POSTING_ID,
            questions: postingQuestions,
          },
        },
      }),
    ),
  )
}

describe('useDocumentEvaluationApplication (MSW)', () => {
  it('모든 답변을 문항 순서대로 번호 붙인 카드로, 파일은 확장자·링크는 주소로 표시', async () => {
    const activities = [{ name: '교내 해커톤', period: '2026.05 ~ 2026.06', role: '기획' }]
    respondWithAnswers([
      createAnswer(
        'portfolio',
        { type: 'FILE_LINK', sortOrder: 2 },
        {
          attachments: [
            { id: 'file', type: 'FILE', url: 'https://cdn.test/a.pdf', fileName: '이력서.pdf' },
            { id: 'no-name', type: 'FILE', url: 'https://cdn.test/b', fileName: null },
            { id: 'link', type: 'LINK', url: 'https://code.example.com/mozip', fileName: null },
          ],
        },
      ),
      createAnswer('strength', { sortOrder: 3, maxLength: null }, { content: '꼼꼼함' }),
      createAnswer(
        'activity',
        {
          type: 'ACTIVITY',
          sortOrder: 1,
          description: '최대 3개',
          options: { activityFields: ['ROLE', 'NAME', 'PERIOD'] },
        },
        { content: JSON.stringify(activities) },
      ),
      createAnswer('motivation', { sortOrder: 0, required: false }),
    ])
    const { result } = renderApplication('application-1')
    await waitFor(() => expect(result.current.application).toBeDefined())

    expect(result.current.application?.positionName).toBeNull()
    expect(result.current.application?.questionCards).toEqual([
      {
        type: 'text',
        id: 'question-motivation',
        header: { number: 1, title: 'motivation', required: false, description: null },
        answer: '',
        maxLength: 300,
      },
      {
        type: 'activity',
        id: 'question-activity',
        header: { number: 2, title: 'activity', required: true, description: '최대 3개' },
        columns: ['name', 'period', 'role'],
        activities,
      },
      {
        type: 'fileLink',
        id: 'question-portfolio',
        header: { number: 3, title: 'portfolio', required: true, description: null },
        attachments: [
          {
            id: 'file',
            type: 'file',
            name: '이력서.pdf',
            meta: 'PDF',
            href: 'https://cdn.test/a.pdf',
          },
          {
            id: 'no-name',
            type: 'file',
            name: '첨부 파일',
            meta: '파일',
            href: 'https://cdn.test/b',
          },
          {
            id: 'link',
            type: 'link',
            name: 'code.example.com/mozip',
            meta: '외부 링크',
            href: 'https://code.example.com/mozip',
          },
        ],
      },
      {
        type: 'text',
        id: 'question-strength',
        header: { number: 4, title: 'strength', required: true, description: null },
        answer: '꼼꼼함',
        maxLength: 500,
      },
    ])
    expect(result.current.application?.availableSlots).toHaveLength(1)
    // 점수 문항은 카드와 같은 순서라 패널 번호도 카드 번호와 같음
    expect(result.current.application?.scoreQuestions).toEqual([
      { id: 'question-motivation', number: 1, label: 'motivation' },
      { id: 'question-activity', number: 2, label: 'activity' },
      { id: 'question-portfolio', number: 3, label: 'portfolio' },
      { id: 'question-strength', number: 4, label: 'strength' },
    ])
  })

  it('비운 문항은 미응답 카드로 만들고, 다른 포지션·미지원 유형 문항은 카드와 번호에서 뺌', async () => {
    const answers = [
      createAnswer('motivation', { sortOrder: 0 }, { content: '지원 동기' }),
      createAnswer('design-tool', { sortOrder: 4 }, { content: 'Figma' }),
    ]
    respondWithAnswers(answers, {
      position: { id: 'design', name: '디자인' },
      postingQuestions: [
        createPostingQuestion('question-motivation', { sortOrder: 0 }),
        createPostingQuestion('question-choice', { type: 'SINGLE_CHOICE', sortOrder: 1 }),
        createPostingQuestion('question-dev-stack', {
          sortOrder: 2,
          position: { id: 'development' },
        }),
        createPostingQuestion('question-skipped', {
          type: 'ACTIVITY',
          required: false,
          sortOrder: 3,
        }),
        createPostingQuestion('question-design-tool', { sortOrder: 4, position: { id: 'design' } }),
      ],
    })
    const { result } = renderApplication('application-1')
    await waitFor(() => expect(result.current.application).toBeDefined())

    expect(
      result.current.application?.questionCards.map(({ id, header }) => [header.number, id]),
    ).toEqual([
      [1, 'question-motivation'],
      [2, 'question-skipped'],
      [3, 'question-design-tool'],
    ])
    expect(result.current.application?.questionCards[1]).toMatchObject({
      type: 'activity',
      header: { required: false },
      activities: [],
    })
    // 점수는 답한 문항만
    expect(result.current.application?.scoreQuestions).toEqual([
      { id: 'question-motivation', number: 1, label: 'motivation' },
      { id: 'question-design-tool', number: 3, label: 'design-tool' },
    ])
  })

  it('활동 경험 설정이 없으면 모든 열, 읽을 수 없는 답변은 빈 목록', async () => {
    respondWithAnswers([createAnswer('activity', { type: 'ACTIVITY' }, { content: '{' })])
    const { result } = renderApplication('application-1')
    await waitFor(() => expect(result.current.application).toBeDefined())

    expect(result.current.application?.questionCards[0]).toMatchObject({
      columns: ['name', 'period', 'role', 'achievement'],
      activities: [],
    })
  })

  it('제출 시점 프로필의 학교·전화번호를 표시하고, 모양이 다르면 비움', async () => {
    respondWithAnswers([], {
      profileSnapshot: { name: '정세나', phone: '01012345678', school: null },
    })
    const { result } = renderApplication('application-1')
    await waitFor(() => expect(result.current.application).toBeDefined())

    expect(result.current.application).toMatchObject({ school: null, phone: '010-1234-5678' })

    respondWithAnswers([], { profileSnapshot: { phone: 1012345678 } })
    const { result: invalidResult } = renderApplication('application-2')
    await waitFor(() => expect(invalidResult.current.application).toBeDefined())

    expect(invalidResult.current.application).toMatchObject({ school: null, phone: null })
  })

  it('공고 문항을 못 받으면 번호를 매길 수 없어 지원서 오류로 처리', async () => {
    respondWithAnswers([createAnswer('motivation', {}, { content: '지원 동기' })])
    server.use(
      graphqlApi.query('PostingQuestions', () =>
        HttpResponse.json({ errors: [{ message: '서버 오류' }], data: null }),
      ),
    )
    const { result } = renderApplication('application-1')
    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.application).toBeUndefined()
    expect(result.current.isNotFound).toBe(false)
  })

  it('없는 지원서는 찾을 수 없음으로 구분', async () => {
    const { result } = renderApplication('missing')
    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.isNotFound).toBe(true)
  })
})
