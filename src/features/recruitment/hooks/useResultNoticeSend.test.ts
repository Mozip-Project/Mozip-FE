import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { createElement, type PropsWithChildren } from 'react'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { recruitmentKeys } from '@/features/recruitment/api/organizer/keys'
import type {
  MessageStatus,
  ResultMessagePanelFieldsFragment,
  ResultMessageProgressQuery,
  ResultMessageProgressQueryVariables,
  ResultMessagesFieldsFragment,
  SendMessagesMutation,
  SendMessagesMutationVariables,
} from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { server } from '@/mocks/server'
import { useResultNoticeSend, type ResultNoticeRecipients } from './useResultNoticeSend'

const showToast = vi.fn()

vi.mock('@/providers/toastProvider', () => ({ useToast: () => ({ showToast }) }))

const POSTING_ID = 'posting-1'

const RECIPIENTS: ResultNoticeRecipients = { pass: [], fail: [] }

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
})

afterAll(() => {
  vi.unstubAllEnvs()
})

beforeEach(() => {
  showToast.mockClear()
})

function createPanel(
  status: MessageStatus,
  counts: Partial<Pick<ResultMessagePanelFieldsFragment, 'processedCount' | 'sendableCount'>> = {},
): ResultMessagePanelFieldsFragment {
  return {
    message: { id: `message-${status}`, status, subject: '제목', body: '본문' },
    variables: ['NAME'],
    recipientCount: 10,
    sendableCount: 10,
    processedCount: 0,
    deliveredCount: 0,
    failedCount: 0,
    recipients: [],
    ...counts,
  }
}

function createNotice(
  pass: ResultMessagePanelFieldsFragment,
  fail: ResultMessagePanelFieldsFragment,
): ResultMessagesFieldsFragment {
  return {
    posting: { id: POSTING_ID, organization: { name: 'UXUX' }, interviewTimeRanges: [] },
    pass,
    fail,
  }
}

const DRAFT_NOTICE = createNotice(createPanel('DRAFT'), createPanel('DRAFT'))

// 요청 대상을 기록하고, 응답 대신 지정한 결과를 돌려줌
function respondSend(response: ResultMessagesFieldsFragment | { code: string; reason?: string }) {
  const requests: SendMessagesMutationVariables[] = []
  server.use(
    graphqlApi.mutation<SendMessagesMutation, SendMessagesMutationVariables>(
      'SendMessages',
      ({ variables }) => {
        requests.push(variables)
        if ('code' in response) {
          return HttpResponse.json({
            errors: [{ message: response.code, extensions: response }],
            data: null,
          })
        }
        return HttpResponse.json({ data: { sendMessages: response } })
      },
    ),
  )
  return requests
}

// 앱과 같은 staleTime으로 이전 발송의 진행률 캐시가 남은 경우 확인
const APP_STALE_TIME_MS = 60 * 1000
// 저장 전 발송 여부를 확인하려고 기다리는 시간
const SAVE_WAIT_CHECK_MS = 50

function createProgressPanel(status: MessageStatus, processedCount: number, deliveredCount = 0) {
  return {
    message: { id: `message-${status}`, status },
    processedCount,
    deliveredCount,
    failedCount: 0,
  }
}

function renderSend(
  flushSave: () => Promise<boolean> = () => Promise.resolve(true),
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } }),
) {
  function Wrapper({ children }: PropsWithChildren) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }

  return renderHook(
    ({ notice }) =>
      useResultNoticeSend({ postingId: POSTING_ID, notice, recipients: RECIPIENTS, flushSave }),
    { wrapper: Wrapper, initialProps: { notice: DRAFT_NOTICE } },
  )
}

describe('useResultNoticeSend', () => {
  it('초안을 먼저 저장한 뒤 고른 대상만 보내고, 서버가 모두 보내면 결과 창으로 전환', async () => {
    const sendingNotice = createNotice(
      createPanel('SENDING', { processedCount: 3 }),
      createPanel('DRAFT'),
    )
    const requests = respondSend(sendingNotice)
    let finishSave: (isSaved: boolean) => void = () => undefined
    const flushSave = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          finishSave = resolve
        }),
    )
    const { result, rerender } = renderSend(flushSave)

    act(() => result.current.openConfirm(['pass']))
    let sendPromise = Promise.resolve()
    act(() => {
      sendPromise = result.current.startSend()
    })
    // 저장이 끝나기 전에 발송 요청이 나갈 시간을 줌
    await act(() => new Promise((resolve) => setTimeout(resolve, SAVE_WAIT_CHECK_MS)))

    expect(flushSave).toHaveBeenCalledOnce()
    expect(requests).toEqual([])

    await act(async () => {
      finishSave(true)
      await sendPromise
    })

    expect(requests).toEqual([expect.objectContaining({ targets: ['PASS'], type: 'DOC_RESULT' })])

    rerender({ notice: sendingNotice })
    expect(result.current.dialog?.phase).toBe('sending')
    expect(result.current.progress).toEqual({ sentCount: 3, totalCount: 10 })

    rerender({ notice: createNotice(createPanel('SENT'), createPanel('DRAFT')) })
    expect(result.current.dialog).toEqual({ phase: 'result', targets: ['pass'] })
    expect(result.current.isSending).toBe(false)
    expect(result.current.sentTargets).toEqual(['pass'])
  })

  it('발송 중 창을 닫으면 끝나도 결과 창을 다시 열지 않음', async () => {
    respondSend(createNotice(createPanel('SENDING'), createPanel('SENDING')))
    const { result, rerender } = renderSend()

    act(() => result.current.openConfirm(['pass', 'fail']))
    await act(() => result.current.startSend())
    act(() => result.current.closeDialog())
    rerender({ notice: createNotice(createPanel('SENT'), createPanel('SENT')) })

    expect(result.current.dialog).toBeNull()
  })

  it('초안 저장에 실패하면 보내지 않고 발송 실패 안내', async () => {
    const requests = respondSend(DRAFT_NOTICE)
    const { result } = renderSend(() => Promise.resolve(false))

    act(() => result.current.openConfirm(['pass']))
    await act(() => result.current.startSend())

    expect(requests).toEqual([])
    expect(result.current.dialog).toBeNull()
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: '서류 결과를 발송하지 못했어요. 다시 발송해 주세요.' }),
    )
  })

  it('면접 변수로 막히면 원인별 안내, 이미 보낸 대상이면 안내 없이 창만 닫음', async () => {
    respondSend({ code: 'MESSAGE_422', reason: 'TIMETABLE_NOT_CONFIRMED' })
    const { result } = renderSend()

    act(() => result.current.openConfirm(['pass']))
    await act(() => result.current.startSend())

    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: '면접 타임테이블을 확정한 뒤 발송해 주세요.' }),
    )

    showToast.mockClear()
    respondSend({ code: 'MESSAGE_409' })
    act(() => result.current.openConfirm(['pass']))
    await act(() => result.current.startSend())

    await waitFor(() => expect(result.current.dialog).toBeNull())
    expect(showToast).not.toHaveBeenCalled()
  })

  it('이전 발송의 진행률 캐시가 남아 있어도 다음 발송에서 바로 진행률을 다시 받음', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: APP_STALE_TIME_MS } },
    })
    // 합격자만 먼저 보내 끝난 상태
    queryClient.setQueryData<ResultMessageProgressQuery['resultMessages']>(
      recruitmentKeys.resultMessageProgress(POSTING_ID),
      { pass: createProgressPanel('SENT', 10), fail: createProgressPanel('DRAFT', 0) },
    )
    server.use(
      graphqlApi.query<ResultMessageProgressQuery, ResultMessageProgressQueryVariables>(
        'ResultMessageProgress',
        () =>
          HttpResponse.json({
            data: {
              resultMessages: {
                pass: createProgressPanel('SENT', 10),
                fail: createProgressPanel('SENDING', 4, 3),
              },
            },
          }),
      ),
    )
    const { result, rerender } = renderSend(undefined, queryClient)

    rerender({ notice: createNotice(createPanel('SENT'), createPanel('SENDING')) })

    await waitFor(() => expect(result.current.progress).toEqual({ sentCount: 4, totalCount: 10 }))
    expect(result.current.results.fail?.sendingDeliveredCount).toBe(3)
  })
})
