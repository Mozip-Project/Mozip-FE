import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { getPostingDraft, savePostingDraft } from '@/features/posting/api/organizer/api'
import { resetManagedPostings } from '@/features/posting/mocks/managedPostingHandlers'
import { resetPostingDrafts } from '@/features/posting/mocks/postingDraftHandlers'
import {
  EMPTY_POSTING_CREATE,
  type PostingCreateValues,
} from '@/features/posting/schemas/postingCreateValues'
import { createQuestion } from '@/features/posting/utils/postingQuestions'
import type { SavePostingDraftMutation, SavePostingDraftMutationVariables } from '@/gql/graphql'
import { resetUploadedFiles } from '@/mocks/fileUploadHandlers'
import { graphqlApi } from '@/mocks/graphqlApi'
import { MOCK_ORGANIZATION_ID } from '@/mocks/mockOrganization'
import { server } from '@/mocks/server'
import { ToastProvider } from '@/providers/toastProvider'
import { usePostingDraftSave } from './usePostingDraftSave'
import type { ReactNode } from 'react'

function Wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  )
}

// 디자인팀 포지션과 그 포지션 문항이 저장된 공고
async function saveDraftWithPositionQuestion() {
  const { id } = await savePostingDraft({
    organizationId: MOCK_ORGANIZATION_ID,
    input: { title: '공고', noPosition: false, positions: [{ name: '디자인팀', sortOrder: 0 }] },
  })
  const posting = await savePostingDraft({
    organizationId: MOCK_ORGANIZATION_ID,
    id,
    input: {
      questions: [
        {
          positionId: (await getPostingDraft(id)).positions[0]?.id,
          type: 'TEXT',
          title: '디자인 질문',
          required: true,
          sortOrder: 0,
        },
      ],
    },
  })
  return posting
}

function positionValues(positionNames: string[], questionTitles: string[]): PostingCreateValues {
  return {
    ...EMPTY_POSTING_CREATE,
    recruitType: 'position',
    positions: positionNames.map((name) => ({ name })),
    questionSets: questionTitles.map((title) => ({
      questions: [{ ...createQuestion('text'), title }],
    })),
  }
}

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
})

afterEach(() => {
  resetManagedPostings()
  resetPostingDrafts()
  resetUploadedFiles()
})

afterAll(() => {
  vi.unstubAllEnvs()
})

function renderNewDraftSave() {
  return renderHook(
    () => usePostingDraftSave({ organizationId: MOCK_ORGANIZATION_ID, hasInterview: false }),
    { wrapper: Wrapper },
  ).result
}

function infoValues(mainImage: File | null): PostingCreateValues {
  return { ...EMPTY_POSTING_CREATE, title: '공고', qualifications: ['student'], mainImage }
}

// 업로드 주소 발급 요청 수 기록, 응답은 기본 MSW
function countPresignedRequests() {
  const counter = { count: 0 }
  server.use(
    http.post('*/api/files/presigned-url', () => {
      counter.count += 1
    }),
  )
  return counter
}

describe('usePostingDraftSave 대표 이미지', () => {
  it('새로 고른 대표 이미지를 올린 뒤 받은 주소로 저장, 같은 파일은 다시 올리지 않음', async () => {
    const presigned = countPresignedRequests()
    const result = renderNewDraftSave()
    const image = new File(['image'], 'main.webp', { type: 'image/webp' })

    expect(await act(() => result.current.saveStep('info', infoValues(image)))).toBe(true)
    expect(await act(() => result.current.saveStep('info', infoValues(image)))).toBe(true)

    const postingId = result.current.postingId ?? ''
    const posting = await getPostingDraft(postingId)
    expect(posting.images).toMatchObject([{ sortOrder: 0, isRepresentative: true }])
    expect(posting.images[0]?.url).toContain('posting_image/')
    expect(presigned.count).toBe(1)
  })

  it('대표 이미지를 올리지 못하면 공고를 저장하지 않고 실패 안내', async () => {
    server.use(
      http.post('*/api/files/presigned-url', () =>
        HttpResponse.json(
          { success: false, code: 'FILE_415', message: '형식 오류', data: null },
          { status: 415 },
        ),
      ),
    )
    const result = renderNewDraftSave()

    const image = new File(['image'], 'main.png', { type: 'image/png' })
    expect(await act(() => result.current.saveStep('info', infoValues(image)))).toBe(false)
    expect(result.current.postingId).toBeNull()
    expect(result.current.saveState).toEqual({ status: 'failed' })
  })
})

describe('usePostingDraftSave', () => {
  it('모집 방식을 그대로 다시 저장하면 포지션 id와 문항 연결 유지', async () => {
    const saved = await saveDraftWithPositionQuestion()
    const { result } = renderHook(
      () =>
        usePostingDraftSave({
          organizationId: MOCK_ORGANIZATION_ID,
          hasInterview: false,
          savedDraft: {
            id: saved.id,
            positions: saved.positions.map(({ id, name }) => ({ id, name })),
            updatedAt: saved.updatedAt,
          },
        }),
      { wrapper: Wrapper },
    )

    await act(() =>
      result.current.saveStep('method', positionValues(['디자인팀'], ['디자인 질문'])),
    )

    const posting = await getPostingDraft(saved.id)
    expect(posting.positions[0]?.id).toBe(saved.positions[0]?.id)
    expect(posting.questions).toMatchObject([{ position: { id: saved.positions[0]?.id } }])
  })

  it('포지션을 바꿔 저장하면 끊긴 문항을 새 포지션 id로 다시 저장', async () => {
    const saved = await saveDraftWithPositionQuestion()
    const { result } = renderHook(
      () =>
        usePostingDraftSave({
          organizationId: MOCK_ORGANIZATION_ID,
          hasInterview: false,
          savedDraft: {
            id: saved.id,
            positions: saved.positions.map(({ id, name }) => ({ id, name })),
            updatedAt: saved.updatedAt,
          },
        }),
      { wrapper: Wrapper },
    )

    await act(() =>
      result.current.saveStep(
        'method',
        positionValues(['디자인팀', '개발팀'], ['디자인 질문', '개발 질문']),
      ),
    )

    const posting = await getPostingDraft(saved.id)
    const [design, develop] = posting.positions
    expect(design?.id).not.toBe(saved.positions[0]?.id)
    expect(posting.questions).toMatchObject([
      { title: '디자인 질문', position: { id: design?.id } },
      { title: '개발 질문', position: { id: develop?.id } },
    ])
  })

  it('문항을 다시 연결하는 요청이 실패해도 다음 저장은 새 포지션 id로 문항 연결', async () => {
    const saved = await saveDraftWithPositionQuestion()
    // 두 번째 요청(문항 다시 연결)만 실패, 나머지는 기본 MSW 응답
    let requestCount = 0
    server.use(
      graphqlApi.mutation<SavePostingDraftMutation, SavePostingDraftMutationVariables>(
        'SavePostingDraft',
        () => {
          requestCount += 1
          if (requestCount === 2) {
            return HttpResponse.json({
              errors: [{ message: '실패', extensions: { code: 'COMMON_500' } }],
              data: null,
            })
          }
        },
      ),
    )
    const { result } = renderHook(
      () =>
        usePostingDraftSave({
          organizationId: MOCK_ORGANIZATION_ID,
          hasInterview: false,
          savedDraft: {
            id: saved.id,
            positions: saved.positions.map(({ id, name }) => ({ id, name })),
            updatedAt: saved.updatedAt,
          },
        }),
      { wrapper: Wrapper },
    )
    const values = positionValues(['디자인팀', '개발팀'], ['디자인 질문', '개발 질문'])

    expect(await act(() => result.current.saveStep('method', values))).toBe(false)
    expect(await act(() => result.current.saveStep('form', values))).toBe(true)

    const posting = await getPostingDraft(saved.id)
    const [design, develop] = posting.positions
    expect(posting.questions).toMatchObject([
      { title: '디자인 질문', position: { id: design?.id } },
      { title: '개발 질문', position: { id: develop?.id } },
    ])
  })
})
