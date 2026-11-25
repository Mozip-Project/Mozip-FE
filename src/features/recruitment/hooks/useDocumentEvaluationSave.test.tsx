import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { useForm } from 'react-hook-form'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { ORGANIZATION_POSTING_ID } from '@/features/posting/mocks/organizationPostingSamples'
import { recruitmentKeys } from '@/features/recruitment/api/organizer/keys'
import type { DocumentEvaluationValues } from '@/features/recruitment/schemas/documentEvaluationSchema'
import type {
  DocEvaluationApplicationChipsQuery,
  SaveDocEvaluationMutation,
  SaveDocEvaluationMutationVariables,
} from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { server } from '@/mocks/server'
import { useDocumentEvaluationSave } from './useDocumentEvaluationSave'
import type { PropsWithChildren } from 'react'

const POSTING_ID = ORGANIZATION_POSTING_ID.docReview
// MSW 평가 저장 상태가 테스트 사이에 이어져 테스트마다 다른 지원자 사용
const SUBMIT_APPLICATION_ID = `application-${POSTING_ID}-1`
const NO_AUTO_SAVE_APPLICATION_ID = `application-${POSTING_ID}-5`
const LEAVE_APPLICATION_ID = `application-${POSTING_ID}-6`
const INSTANT_SAVE_APPLICATION_ID = `application-${POSTING_ID}-7`
const SUBMIT_LOCK_APPLICATION_ID = `application-${POSTING_ID}-8`
// 자동 저장 대기(3초)보다 짧게 기다려 자동 저장이 아닌 이탈 저장만 확인
const BEFORE_AUTO_SAVE_MS = 100

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
})

afterAll(() => {
  vi.unstubAllEnvs()
})

// 요청 내용만 기록하고 응답은 기본 MSW handler로 넘김
function recordSaveRequests() {
  const requests: SaveDocEvaluationMutationVariables[] = []
  server.use(
    graphqlApi.mutation<SaveDocEvaluationMutation, SaveDocEvaluationMutationVariables>(
      'SaveDocEvaluation',
      ({ variables }) => {
        requests.push(variables)
      },
    ),
  )
  return requests
}

function respondSaveError(code: string, fieldErrors: { field: string; message: string }[] = []) {
  server.use(
    graphqlApi.mutation('SaveDocEvaluation', () =>
      HttpResponse.json({
        errors: [{ message: code, extensions: { code, fieldErrors } }],
        data: null,
      }),
    ),
  )
}

function renderSave(applicationId: string, canAutoSave: boolean) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  })
  queryClient.setQueryData<DocEvaluationApplicationChipsQuery['docEvaluationApplicationChips']>(
    recruitmentKeys.docEvaluationChips(POSTING_ID),
    [{ application: { id: applicationId, user: { name: '정세나' } }, myEvaluationStatus: 'NONE' }],
  )
  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  const rendered = renderHook(
    () => {
      const form = useForm<DocumentEvaluationValues>({
        defaultValues: { opinion: '', scores: {}, memo: '' },
      })
      const save = useDocumentEvaluationSave({
        postingId: POSTING_ID,
        applicationId,
        form,
        scoreQuestionIds: ['motivation'],
        savedAt: null,
        canAutoSave,
      })
      return { form, ...save }
    },
    { wrapper: Wrapper },
  )

  return { ...rendered, queryClient }
}

describe('useDocumentEvaluationSave (MSW)', () => {
  it('저장 버튼은 저장 완료로 보내고, 칩은 재조회 없이 체크 상태로 갱신', async () => {
    const requests = recordSaveRequests()
    const { result, queryClient } = renderSave(SUBMIT_APPLICATION_ID, true)

    act(() => {
      result.current.form.setValue('opinion', 'pass')
      result.current.form.setValue('scores.motivation', '5')
    })
    const payload = await act(() => result.current.submitEvaluation())

    // 고를 때마다 작성 중으로 저장한 뒤 마지막에 저장 완료로 보냄
    expect(requests.at(-1)).toEqual({
      input: {
        applicationId: SUBMIT_APPLICATION_ID,
        opinion: 'PASS',
        scores: [{ questionId: 'motivation', score: 5 }],
        memo: null,
      },
      submit: true,
    })
    expect(payload?.evaluation.status).toBe('SAVED')
    expect(result.current.saveState.status).toBe('saved')
    expect(
      queryClient.getQueryData<DocEvaluationApplicationChipsQuery['docEvaluationApplicationChips']>(
        recruitmentKeys.docEvaluationChips(POSTING_ID),
      )?.[0]?.myEvaluationStatus,
    ).toBe('SAVED')
  })

  it('자동 저장을 끈 평가(저장 완료·결과 확정)는 입력하고 떠나도 저장하지 않음', async () => {
    const requests = recordSaveRequests()
    const { result, unmount } = renderSave(NO_AUTO_SAVE_APPLICATION_ID, false)

    act(() => result.current.form.setValue('memo', '수정'))
    unmount()
    await new Promise((resolve) => setTimeout(resolve, BEFORE_AUTO_SAVE_MS))

    expect(requests).toEqual([])
  })

  it('점수를 고르면 기다리지 않고 바로 작성 중으로 저장', async () => {
    const requests = recordSaveRequests()
    const { result } = renderSave(INSTANT_SAVE_APPLICATION_ID, true)

    act(() => result.current.form.setValue('scores.motivation', '3'))

    await waitFor(() =>
      expect(requests).toEqual([
        {
          input: {
            applicationId: INSTANT_SAVE_APPLICATION_ID,
            opinion: null,
            scores: [{ questionId: 'motivation', score: 3 }],
            memo: null,
          },
          submit: false,
        },
      ]),
    )
    await waitFor(() => expect(result.current.saveState.status).toBe('saved'))
  })

  it('메모는 입력을 멈춘 뒤 저장하고, 그 전에 화면을 떠나면 바로 작성 중으로 저장', async () => {
    const requests = recordSaveRequests()
    const { result, unmount } = renderSave(LEAVE_APPLICATION_ID, true)

    act(() => result.current.form.setValue('memo', '면접에서 확인'))
    await new Promise((resolve) => setTimeout(resolve, BEFORE_AUTO_SAVE_MS))
    expect(requests).toEqual([])

    unmount()

    await waitFor(() =>
      expect(requests).toEqual([
        {
          input: {
            applicationId: LEAVE_APPLICATION_ID,
            opinion: null,
            scores: [],
            memo: '면접에서 확인',
          },
          submit: false,
        },
      ]),
    )
  })

  it('저장 버튼 요청 중에 바꾼 값은 작성 중으로 저장하지 않고, 저장 완료 뒤 떠나도 저장하지 않음', async () => {
    // 저장 버튼 응답을 붙잡아 두고 그 사이에 값을 바꿈
    let releaseSubmit = () => {}
    const submitGate = new Promise<void>((resolve) => {
      releaseSubmit = resolve
    })
    server.use(
      graphqlApi.mutation<SaveDocEvaluationMutation, SaveDocEvaluationMutationVariables>(
        'SaveDocEvaluation',
        async ({ variables }) => {
          if (variables.submit) {
            await submitGate
          }
        },
      ),
    )
    const requests = recordSaveRequests()
    const { result, unmount } = renderSave(SUBMIT_LOCK_APPLICATION_ID, true)

    act(() => {
      result.current.form.setValue('opinion', 'pass')
      result.current.form.setValue('scores.motivation', '5')
    })
    let submitting: Promise<unknown> = Promise.resolve()
    act(() => {
      submitting = result.current.submitEvaluation()
    })
    await waitFor(() => expect(requests.some(({ submit }) => submit)).toBe(true))

    act(() => result.current.form.setValue('opinion', 'hold'))
    releaseSubmit()
    await act(() => submitting)
    unmount()
    await new Promise((resolve) => setTimeout(resolve, BEFORE_AUTO_SAVE_MS))

    expect(requests.at(-1)?.submit).toBe(true)
  })

  it('입력값 검증 실패(COMMON_400)의 의견 오류는 의견 입력에 표시', async () => {
    respondSaveError('COMMON_400', [{ field: 'opinion', message: '의견은 필수입니다.' }])
    const { result } = renderSave(SUBMIT_APPLICATION_ID, false)

    const payload = await act(() => result.current.submitEvaluation())

    expect(payload).toBeNull()
    expect(result.current.saveState.status).toBe('failed')
    expect(result.current.form.getFieldState('opinion').error?.message).toBe('의견은 필수입니다.')
  })

  it('결과 확정 뒤 저장(EVALUATION_423)은 공고를 다시 받고, 실패한 뒤엔 자동 저장 재개', async () => {
    respondSaveError('EVALUATION_423')
    const { result, queryClient } = renderSave(SUBMIT_LOCK_APPLICATION_ID, true)
    queryClient.setQueryData(recruitmentKeys.posting(POSTING_ID), { id: POSTING_ID })

    const payload = await act(() => result.current.submitEvaluation())

    expect(payload).toBeNull()
    expect(queryClient.getQueryState(recruitmentKeys.posting(POSTING_ID))?.isInvalidated).toBe(true)

    const requests = recordSaveRequests()
    act(() => result.current.form.setValue('scores.motivation', '3'))
    await waitFor(() => expect(requests.at(-1)?.submit).toBe(false))
  })
})
