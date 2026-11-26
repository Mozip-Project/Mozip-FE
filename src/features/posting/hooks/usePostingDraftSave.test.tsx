import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { getPostingDraft, savePostingDraft } from '@/features/posting/api/organizer/api'
import { resetManagedPostings } from '@/features/posting/mocks/managedPostingHandlers'
import { resetPostingDrafts } from '@/features/posting/mocks/postingDraftHandlers'
import {
  EMPTY_POSTING_CREATE,
  type PostingCreateValues,
} from '@/features/posting/schemas/postingCreateValues'
import { createQuestion } from '@/features/posting/utils/postingQuestions'
import { MOCK_ORGANIZATION_ID } from '@/mocks/mockOrganization'
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
})

afterAll(() => {
  vi.unstubAllEnvs()
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
})
