import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { afterAll, beforeAll, describe, expect, it, onTestFinished, vi } from 'vitest'
import { ORGANIZATION_POSTING_ID } from '@/features/posting/mocks/organizationPostingSamples'
import type { ResultNoticeFormValues } from '@/features/recruitment/schemas/resultNoticeMessageSchema'
import type {
  MessageStatus,
  SaveMessageMutation,
  SaveMessageMutationVariables,
} from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { server } from '@/mocks/server'
import { useResultNoticeMessageSave } from './useResultNoticeMessageSave'
import type { PropsWithChildren } from 'react'

// 서류 결과를 확정한 공고
const POSTING_ID = ORGANIZATION_POSTING_ID.noInterviewResult
const AUTO_SAVE_DELAY_MS = 3000
// 자동 저장 대기보다 짧게 기다려 보낸 요청이 없는지 확인
const SHORT_WAIT_MS = 100

const MESSAGES = {
  pass: { subject: '합격 제목', body: '{이름}님 합격' },
  fail: { subject: '불합격 제목', body: '{이름}님 불합격' },
} satisfies ResultNoticeFormValues

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
})

afterAll(() => {
  vi.unstubAllEnvs()
})

// 요청 내용만 기록하고 응답은 기본 MSW handler로 넘김
function recordSaveRequests() {
  const requests: SaveMessageMutationVariables[] = []
  server.use(
    graphqlApi.mutation<SaveMessageMutation, SaveMessageMutationVariables>(
      'SaveMessage',
      ({ variables }) => {
        requests.push(variables)
      },
    ),
  )
  return requests
}

function renderSave(messageStatuses: Record<'pass' | 'fail', MessageStatus | null>) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  return renderHook(
    () => {
      const form = useForm<ResultNoticeFormValues>({ defaultValues: MESSAGES })
      return {
        form,
        ...useResultNoticeMessageSave({ postingId: POSTING_ID, form, messageStatuses }),
      }
    },
    { wrapper: Wrapper },
  )
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

describe('useResultNoticeMessageSave (MSW)', () => {
  it('입력을 멈추면 바뀐 대상만 저장하고, 빈 칸이면 저장하지 않음', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    onTestFinished(() => {
      vi.useRealTimers()
    })
    const requests = recordSaveRequests()
    const { result } = renderSave({ pass: 'DRAFT', fail: 'DRAFT' })

    act(() => result.current.form.setValue('pass.body', '{이름}님 최종 합격'))
    await act(() => vi.advanceTimersByTimeAsync(AUTO_SAVE_DELAY_MS))
    await waitFor(() => expect(requests).toHaveLength(1))
    expect(requests[0]).toMatchObject({ target: 'PASS', body: '{이름}님 최종 합격' })

    act(() => result.current.form.setValue('fail.subject', '  '))
    await act(() => vi.advanceTimersByTimeAsync(AUTO_SAVE_DELAY_MS + SHORT_WAIT_MS))
    expect(requests).toHaveLength(1)
  })

  it('저장 전에 화면을 떠나면 남은 입력을 바로 저장, 발송을 시작한 메시지는 저장하지 않음', async () => {
    const requests = recordSaveRequests()
    const { result, unmount } = renderSave({ pass: 'DRAFT', fail: 'SENDING' })

    act(() => {
      result.current.form.setValue('pass.subject', '떠나기 전 제목')
      result.current.form.setValue('fail.subject', '보낸 뒤 제목')
    })
    await wait(SHORT_WAIT_MS)
    expect(requests).toEqual([])

    unmount()

    await waitFor(() => expect(requests).toHaveLength(1))
    expect(requests[0]).toMatchObject({ target: 'PASS', subject: '떠나기 전 제목' })
  })
})
