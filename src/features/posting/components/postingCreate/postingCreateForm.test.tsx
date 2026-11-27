import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createEvent, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetManagedPostings } from '@/features/posting/mocks/managedPostingHandlers'
import { resetPostingDrafts } from '@/features/posting/mocks/postingDraftHandlers'
import type { SavePostingDraftMutation, SavePostingDraftMutationVariables } from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { MOCK_ORGANIZATION_ID } from '@/mocks/mockOrganization'
import { server } from '@/mocks/server'
import { ToastProvider } from '@/providers/toastProvider'
import { PostingCreateForm } from './postingCreateForm'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))

// Next처럼 history 호출과 뒤로가기를 useSearchParams에 반영
const LOCATION_CHANGE_EVENT = 'test:locationchange'

function subscribeToLocation(onChange: () => void) {
  window.addEventListener('popstate', onChange)
  window.addEventListener(LOCATION_CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener(LOCATION_CHANGE_EVENT, onChange)
  }
}

vi.mock('next/navigation', async () => {
  const { useSyncExternalStore } = await import('react')
  return {
    useRouter: () => ({ push }),
    useSearchParams: () =>
      new URLSearchParams(useSyncExternalStore(subscribeToLocation, () => window.location.search)),
  }
})

function notifyHistoryCalls() {
  for (const method of ['pushState', 'replaceState'] as const) {
    const original = window.history[method].bind(window.history)
    vi.spyOn(window.history, method).mockImplementation((...args) => {
      original(...args)
      window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT))
    })
  }
}

// jsdom 미지원
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const IMAGE_FILE = new File(['image'], 'main.png', { type: 'image/png' })

function renderForm(hasInterview = true) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <PostingCreateForm hasInterview={hasInterview} savedOrganizationId={MOCK_ORGANIZATION_ID} />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
})

afterEach(() => {
  resetManagedPostings()
  resetPostingDrafts()
  window.history.replaceState(null, '', '/')
  push.mockClear()
})

afterAll(() => {
  vi.unstubAllEnvs()
})

function getCurrentStep() {
  const steps = screen.getByRole('list', { name: '공고 작성 단계' })
  return within(steps)
    .getAllByRole('listitem')
    .find((step) => step.getAttribute('aria-current') === 'step')
}

// 다음은 저장 응답을 받은 뒤 단계를 넘겨 현재 단계가 바뀔 때까지 대기
async function clickNext(user: ReturnType<typeof userEvent.setup>) {
  const currentStep = getCurrentStep()
  await user.click(screen.getByRole('button', { name: '다음' }))
  await waitFor(() => expect(getCurrentStep()).not.toBe(currentStep))
}

// 단계 탭도 현재 단계를 저장한 뒤 이동해 현재 단계가 바뀔 때까지 대기
async function clickStep(user: ReturnType<typeof userEvent.setup>, step: HTMLElement) {
  const currentStep = getCurrentStep()
  await user.click(step)
  await waitFor(() => expect(getCurrentStep()).not.toBe(currentStep))
}

function getFileInput() {
  return screen.getByLabelText(/파일을 끌어다 놓거나 파일 선택/)
}

async function fillInfoStep(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByRole('textbox', { name: /공고 제목/ }), 'UXUX 14기 신입 부원 모집')
  await user.upload(getFileInput(), IMAGE_FILE)
  await user.click(screen.getByRole('checkbox', { name: '대학생' }))
  await waitFor(() => expect(screen.getByRole('button', { name: '다음' })).toBeEnabled())
}

function setupWithDate() {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 1, 10, 0))
  return userEvent.setup()
}

// 비면접 통합 모집으로 검토 단계까지 저장하며 이동
async function goToReviewStep(user: ReturnType<typeof userEvent.setup>) {
  await goToMethodStep(user)
  await user.click(screen.getByRole('radio', { name: '통합 모집' }))
  await clickNext(user)
  await clickNext(user)
}

async function confirmPublish(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: '공고 게시' }))
  const dialog = await screen.findByRole('dialog', { name: '공고를 게시하시겠어요?' })
  await user.click(within(dialog).getByRole('button', { name: '게시하기' }))
}

function publishError(code: string, fieldErrors?: { field: string; message: string }[]) {
  return graphqlApi.mutation('PublishPosting', () =>
    HttpResponse.json({
      errors: [{ message: '게시할 수 없습니다.', extensions: { code, fieldErrors } }],
      data: null,
    }),
  )
}

// 응답은 기본 handler에 맡기고 저장·게시 요청 순서와 저장한 문항 제목만 기록
function recordPostingRequests() {
  const requests: { operation: string; questionTitles?: string[] }[] = []
  server.use(
    graphqlApi.mutation<SavePostingDraftMutation, SavePostingDraftMutationVariables>(
      'SavePostingDraft',
      ({ variables }) => {
        requests.push({
          operation: 'SavePostingDraft',
          questionTitles: variables.input.questions?.map(({ title }) => title),
        })
      },
    ),
    graphqlApi.mutation('PublishPosting', () => {
      requests.push({ operation: 'PublishPosting' })
    }),
  )
  return requests
}

async function goToMethodStep(user: ReturnType<typeof userEvent.setup>) {
  await fillInfoStep(user)
  await clickNext(user)

  const pickDate = async (trigger: HTMLElement, dayLabel: string) => {
    await user.click(trigger)
    await user.click(await screen.findByRole('button', { name: dayLabel }))
  }
  const [startDate, endDate] = screen.getAllByRole('button', { name: /^날짜/ })
  if (!startDate || !endDate) {
    throw new Error('모집 시작·마감 날짜 필드 없음')
  }
  await pickDate(startDate, '2026년 10월 1일 목요일')
  await pickDate(endDate, '2026년 10월 8일 목요일')
  const documentResultDate = screen.queryByRole('button', {
    name: /^서류 결과 발표일/,
  })
  if (documentResultDate) {
    await pickDate(documentResultDate, '2026년 10월 22일 목요일')
  }
  await pickDate(
    screen.getByRole('button', { name: /^최종 결과 발표일/ }),
    '2026년 10월 28일 수요일',
  )
  await waitFor(() => expect(screen.getByRole('button', { name: '다음' })).toBeEnabled())
  await clickNext(user)
}

async function addPosition(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole('button', { name: '포지션 추가' }))
  const dialog = await screen.findByRole('dialog', { name: '추가할 포지션을 입력해 주세요' })
  await user.type(within(dialog).getByRole('textbox', { name: '포지션' }), name)
  await user.click(within(dialog).getByRole('button', { name: '추가하기' }))
}

function getQuestionCards() {
  return within(screen.getByRole('list', { name: '지원서 문항' }))
    .getAllByRole('button', { name: /^Q\d+ .* 편집$/ })
    .map((button) => button.getAttribute('aria-label'))
}

describe('PostingCreateForm', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverStub)
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:main-image')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    // jsdom 미지원
    Element.prototype.scrollIntoView = vi.fn()
    notifyHistoryCalls()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('면접 여부에 따라 단계 수가 달라지고 첫 단계가 현재 단계', () => {
    renderForm(false)

    const steps = screen.getByRole('list', { name: '공고 작성 단계' })
    expect(steps).not.toHaveTextContent('면접 시간 설정')
    expect(screen.getByText(/공고 정보/).closest('li')).toHaveAttribute('aria-current', 'step')
  })

  it('공고 제목, 대표 이미지, 지원 자격을 모두 채워야 다음 활성', async () => {
    const user = userEvent.setup()
    renderForm()
    const nextButton = screen.getByRole('button', { name: '다음' })

    expect(nextButton).toBeDisabled()

    await user.type(screen.getByRole('textbox', { name: /공고 제목/ }), 'UXUX 14기 신입 부원 모집')
    expect(nextButton).toBeDisabled()

    await user.upload(getFileInput(), IMAGE_FILE)
    await waitFor(() => expect(nextButton).toBeDisabled())

    await user.click(screen.getByRole('checkbox', { name: '대학생' }))
    await waitFor(() => expect(nextButton).toBeEnabled())
  })

  it('이미지 X를 누르면 업로드 영역으로 돌아가고 다음 비활성', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByRole('textbox', { name: /공고 제목/ }), '공고')
    await user.click(screen.getByRole('checkbox', { name: '대학생' }))
    await user.upload(getFileInput(), IMAGE_FILE)
    expect(screen.getByRole('img', { name: '대표 이미지' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: '다음' })).toBeEnabled())

    await user.click(screen.getByRole('button', { name: '대표 이미지 삭제' }))

    expect(screen.queryByRole('img', { name: '대표 이미지' })).not.toBeInTheDocument()
    expect(getFileInput()).toHaveFocus()
    await waitFor(() => expect(screen.getByRole('button', { name: '다음' })).toBeDisabled())
  })

  it('대표 이미지 안내 아이콘을 누르면 등록 안내를 보여 주고 닫기로 닫힘', async () => {
    const user = userEvent.setup()
    renderForm()

    expect(screen.getByRole('group', { name: '대표 이미지 필수' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '대표 이미지 등록 안내 보기' }))

    const popover = await screen.findByRole('dialog', { name: '대표 이미지 등록은 이렇게 해요' })
    expect(popover).toHaveTextContent('최적 사이즈는 1600 × 800 px')

    await user.click(screen.getByRole('button', { name: '닫기' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('JPG·PNG·WEBP가 아닌 파일은 올리지 않고 안내', async () => {
    const user = userEvent.setup({ applyAccept: false })
    renderForm()

    await user.upload(getFileInput(), new File(['pdf'], 'doc.pdf', { type: 'application/pdf' }))

    expect(await screen.findByText('JPG, PNG, WEBP 이미지만 업로드 가능해요')).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: '대표 이미지' })).not.toBeInTheDocument()
  })

  it('체크한 공개 항목의 입력칸만 표시', async () => {
    const user = userEvent.setup()
    renderForm()

    expect(screen.queryByRole('textbox', { name: '활동 지역' })).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: '회비' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: '활동 지역' }))
    expect(screen.getByRole('textbox', { name: '활동 지역' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: '회비' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: '회비' }))
    expect(screen.getByRole('textbox', { name: '회비' })).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: '활동 지역' }))
    expect(screen.queryByRole('textbox', { name: '활동 지역' })).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: '회비' })).toBeInTheDocument()
  })

  it('지원 자격 직접 입력을 체크하면 입력칸 표시', async () => {
    const user = userEvent.setup()
    renderForm()
    const customField = () => screen.queryByRole('textbox', { name: '직접 입력' })

    expect(customField()).not.toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: '직접 입력' }))
    expect(customField()).toHaveAttribute(
      'placeholder',
      '예) 1~3학년, 졸업 예정자 가능, 타 학교 학생 가능',
    )

    await user.type(screen.getByRole('textbox', { name: '직접 입력' }), '졸업 예정자 가능')
    expect(customField()).toHaveValue('졸업 예정자 가능')

    await user.click(screen.getByRole('checkbox', { name: '직접 입력' }))
    expect(customField()).not.toBeInTheDocument()
  })

  it('체크하고 비운 채 입력칸을 벗어나면 입력 안내를 칸 아래에 표시', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('checkbox', { name: '활동 지역' }))
    await user.click(screen.getByRole('checkbox', { name: '회비' }))
    await user.click(screen.getByRole('checkbox', { name: '직접 입력' }))
    const regionInput = screen.getByRole('textbox', { name: '활동 지역' })
    // 아직 입력칸에 들어가지 않았으면 안내 없음
    expect(regionInput).not.toHaveAttribute('aria-invalid', 'true')

    for (const name of ['활동 지역', '회비', '직접 입력']) {
      await user.click(screen.getByRole('textbox', { name }))
      await user.tab()
    }
    expect(regionInput).toHaveAttribute('aria-invalid', 'true')
    expect(regionInput).toHaveAccessibleDescription('활동 지역을 입력해 주세요')
    expect(screen.getByRole('textbox', { name: '회비' })).toHaveAccessibleDescription(
      '회비를 입력해 주세요',
    )
    expect(screen.getByRole('textbox', { name: '직접 입력' })).toHaveAccessibleDescription(
      '지원 자격을 입력해 주세요',
    )

    await user.type(regionInput, '서울 마포구')
    expect(regionInput).not.toHaveAttribute('aria-invalid', 'true')
    expect(regionInput).not.toHaveAccessibleDescription()
  })

  it('회비는 숫자만 받아 세 자리마다 쉼표 표시', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('checkbox', { name: '회비' }))
    const feeInput = screen.getByRole('textbox', { name: '회비' })

    await user.type(feeInput, '30000원')
    expect(feeInput).toHaveValue('30,000')

    await user.clear(feeInput)
    await user.type(feeInput, '1234567')
    expect(feeInput).toHaveValue('1,234,567')
  })

  it('회비 중간에서 숫자를 지워도 커서가 같은 자리에 유지', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('checkbox', { name: '회비' }))
    const feeInput = screen.getByRole<HTMLInputElement>('textbox', { name: '회비' })

    await user.type(feeInput, '1234567')
    feeInput.setSelectionRange(5, 5)
    await user.keyboard('{Backspace}')

    expect(feeInput).toHaveValue('123,567')
    expect(feeInput.selectionStart).toBe(3)
  })

  it('제목 없이 임시 저장을 누르면 저장하지 않고 제목 입력 안내', async () => {
    const user = userEvent.setup()
    renderForm()
    const saveButton = screen.getByRole('button', { name: '임시 저장' })
    await waitFor(() => expect(saveButton).toBeEnabled())

    await user.click(saveButton)

    expect(
      await screen.findByText('공고 제목을 입력하면 임시 저장할 수 있어요'),
    ).toBeInTheDocument()
    expect(screen.queryByText('저장 완료')).not.toBeInTheDocument()
  })

  it('임시 저장하면 공고가 만들어지고 편집 주소로 바뀌며 저장 시각 표시와 안내 토스트', async () => {
    const user = userEvent.setup()
    renderForm()
    const saveButton = screen.getByRole('button', { name: '임시 저장' })
    await waitFor(() => expect(saveButton).toBeEnabled())

    await user.type(screen.getByRole('textbox', { name: /공고 제목/ }), 'UXUX 14기 신입 부원 모집')
    await user.click(saveButton)

    expect(await screen.findByText('임시 저장되었습니다')).toBeInTheDocument()
    expect(screen.getByText('공고 관리 탭에서 언제든 이어 쓸 수 있어요')).toBeInTheDocument()
    expect(screen.getByText('저장 완료')).toBeInTheDocument()
    expect(window.location.pathname).toMatch(/^\/manage\/postings\/.+\/edit$/)
  })

  it('저장에 실패하면 안내하고 현재 단계에 머묾', async () => {
    server.use(
      graphqlApi.mutation('SavePostingDraft', () =>
        HttpResponse.json({
          errors: [{ message: '공고를 저장할 수 없습니다.', extensions: { code: 'COMMON_500' } }],
          data: null,
        }),
      ),
    )
    const user = userEvent.setup()
    renderForm()

    await fillInfoStep(user)
    await user.click(screen.getByRole('button', { name: '다음' }))

    expect(await screen.findByText('저장하지 못했어요')).toBeInTheDocument()
    expect(screen.getByText('공고를 저장할 수 없습니다.')).toBeInTheDocument()
    expect(screen.getByText(/공고 정보/).closest('li')).toHaveAttribute('aria-current', 'step')
  })

  it('단계를 옮기면 주소에 기록하고 뒤로가기·앞으로가기로 단계 이동', async () => {
    const user = userEvent.setup()
    renderForm()
    await fillInfoStep(user)
    await clickNext(user)

    expect(window.location.pathname).toMatch(/^\/manage\/postings\/.+\/edit$/)
    expect(window.location.search).toBe('?step=schedule')

    window.history.back()
    expect(await screen.findByRole('textbox', { name: /공고 제목/ })).toHaveValue(
      'UXUX 14기 신입 부원 모집',
    )
    expect(window.location.search).toBe('?step=info')

    window.history.forward()
    expect(await screen.findByRole('heading', { name: '모집 일정' })).toBeInTheDocument()
  })

  it('뒤로가기로 포지션을 추가하고 앞으로가기로 돌아와도 포지션에 맞춰 문항 정리', async () => {
    const user = setupWithDate()
    renderForm(false)
    await goToMethodStep(user)
    await user.click(screen.getByRole('radio', { name: '포지션별 모집' }))
    await addPosition(user, '디자인팀')
    await clickNext(user)
    expect(screen.getByRole('tab', { name: '디자인팀' })).toBeInTheDocument()

    window.history.back()
    expect(await screen.findByRole('heading', { name: '모집 유형' })).toBeInTheDocument()
    await addPosition(user, '개발팀')
    window.history.forward()

    await user.click(await screen.findByRole('tab', { name: '개발팀' }))
    expect(getQuestionCards()).toHaveLength(3)
  })

  it.each([
    [true, true],
    [false, false],
  ])(
    '1단계를 채우고 다음을 누르면 모집 일정 단계로 이동 (면접 %s)',
    async (hasInterview, hasDocumentResult) => {
      const user = userEvent.setup()
      renderForm(hasInterview)

      await fillInfoStep(user)
      await clickNext(user)

      expect(screen.getByRole('heading', { name: '모집 일정' })).toBeInTheDocument()
      expect(screen.getByText(/모집 일정/, { selector: 'li span' }).closest('li')).toHaveAttribute(
        'aria-current',
        'step',
      )
      expect(screen.getByRole('group', { name: '모집 시작 필수' })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: '모집 마감 필수' })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: '활동 기간' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /서류 결과 발표일/ }) !== null).toBe(
        hasDocumentResult,
      )
      expect(screen.getByRole('button', { name: '다음' })).toBeDisabled()
    },
  )

  it('모집 일정을 채우면 모집 유형 단계로 이동, 포지션별은 포지션이 없으면 비활성이고 통합은 바로 활성', async () => {
    const user = setupWithDate()
    renderForm(false)
    await goToMethodStep(user)

    expect(screen.getByRole('heading', { name: '모집 유형' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '다음' })).toBeDisabled()

    await user.click(screen.getByRole('radio', { name: '포지션별 모집' }))
    expect(screen.getByRole('radio', { name: '포지션별 모집' })).toBeChecked()
    expect(screen.getByRole('button', { name: '다음' })).toBeDisabled()

    await user.click(screen.getByRole('radio', { name: '통합 모집' }))
    await waitFor(() => expect(screen.getByRole('button', { name: '다음' })).toBeEnabled())
    // 현재·아직 가지 않은 단계는 이동 불가, 돌아가도 입력값 유지
    const stepList = screen.getByRole('list', { name: '공고 작성 단계' })
    expect(within(stepList).queryByRole('button', { name: /모집 방식/ })).not.toBeInTheDocument()
    expect(within(stepList).queryByRole('button', { name: /지원서 양식/ })).not.toBeInTheDocument()
    await clickStep(user, within(stepList).getByRole('button', { name: /공고 정보/ }))
    const titleInput = screen.getByRole('textbox', { name: /공고 제목/ })
    expect(titleInput).toHaveValue('UXUX 14기 신입 부원 모집')

    // 다녀온 단계까지는 다시 이동, 앞 단계 입력이 비면 건너뛰기 불가
    expect(within(stepList).getByRole('button', { name: /모집 일정/ })).toBeInTheDocument()
    expect(within(stepList).getByRole('button', { name: /모집 방식/ })).toBeInTheDocument()
    expect(within(stepList).queryByRole('button', { name: /지원서 양식/ })).not.toBeInTheDocument()
    await user.clear(titleInput)
    expect(within(stepList).queryByRole('button')).not.toBeInTheDocument()
    await user.type(titleInput, '새 제목')
    await clickStep(user, within(stepList).getByRole('button', { name: /모집 방식/ }))
    expect(screen.getByRole('radio', { name: '통합 모집' })).toBeChecked()
  })

  it('통합 모집 지원서 양식은 기본 문항 3개, 선택한 문항 설정을 고치면 카드에 바로 반영', async () => {
    const user = setupWithDate()
    renderForm()
    await goToMethodStep(user)
    await user.click(screen.getByRole('radio', { name: '통합 모집' }))
    await clickNext(user)

    expect(await screen.findByText('기본 문항 3개를 추가했어요')).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '지원자 프로필 사진을 필수로 받기' })).toBeChecked()
    await user.click(screen.getByRole('button', { name: '프로필 사진 필수 안내' }))
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      '사진이 없는 지원자는 업로드 후 지원할 수 있어요',
    )
    expect(getQuestionCards()).toEqual([
      'Q1 자기소개를 해 주세요 편집',
      'Q2 지원 동기를 작성해 주세요 편집',
      'Q3 지원 분야와 관련된 경험을 알려 주세요 편집',
    ])
    expect(screen.getByRole('complementary', { name: 'Q1 문항 설정' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '다음' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: /^Q2 / }))
    const settings = screen.getByRole('complementary', { name: 'Q2 문항 설정' })
    expect(settings.closest('li')).toContainElement(
      screen.getByRole('button', { name: /^Q2 .* 편집$/ }),
    )
    const titleInput = within(settings).getByRole('textbox', { name: /질문/ })
    await user.clear(titleInput)
    expect(screen.getByRole('button', { name: 'Q2 질문을 작성해 주세요 편집' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '다음' })).toBeDisabled()

    await user.type(titleInput, '가장 몰입했던 경험')
    expect(screen.getByRole('button', { name: 'Q2 가장 몰입했던 경험 편집' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '다음' })).toBeEnabled()

    await user.click(within(settings).getByRole('switch'))
    expect(within(settings).getByRole('switch')).not.toBeChecked()
  })

  it('문항 유형 버튼으로 추가하면 새 문항이 선택되고, 메뉴에서 삭제', async () => {
    const user = setupWithDate()
    renderForm()
    await goToMethodStep(user)
    await user.click(screen.getByRole('radio', { name: '통합 모집' }))
    await clickNext(user)

    await user.click(screen.getByRole('button', { name: '활동 경험 문항 추가' }))
    expect(getQuestionCards().at(-1)).toBe('Q4 질문을 작성해 주세요 편집')
    const settings = screen.getByRole('complementary', { name: 'Q4 문항 설정' })
    expect(within(settings).getByRole('textbox', { name: /질문/ })).toHaveFocus()
    expect(within(settings).getByText('활동 경험')).toBeInTheDocument()
    expect(
      within(settings).queryByRole('textbox', { name: /최대 글자 수/ }),
    ).not.toBeInTheDocument()
    expect(within(settings).getByRole('checkbox', { name: '활동명' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '다음' })).toBeDisabled()

    const card = screen.getByRole('button', { name: 'Q4 질문을 작성해 주세요 편집' }).closest('li')
    if (!card) {
      throw new Error('Q4 카드 없음')
    }
    expect(within(card).getByRole('textbox', { name: '역할' })).toBeInTheDocument()
    await user.click(within(settings).getByRole('checkbox', { name: '역할' }))
    expect(within(card).queryByRole('textbox', { name: '역할' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '템플릿으로 추가' }))
    expect((await screen.findAllByRole('menuitem')).map((item) => item.textContent)).toEqual([
      '팀워크형',
      '활동 의지형',
      '포트폴리오형',
    ])
    await user.keyboard('{Escape}')

    await user.click(screen.getByRole('button', { name: 'Q4 문항 메뉴' }))
    await user.click(await screen.findByRole('menuitem', { name: '질문 삭제' }))
    expect(getQuestionCards()).toHaveLength(3)
    expect(screen.getByRole('button', { name: '다음' })).toBeEnabled()
  })

  it('포트폴리오형 템플릿을 고르면 기존 문항 아래에 추가되고, 파일 문항 설정이 카드 미리보기에 반영', async () => {
    const user = setupWithDate()
    renderForm()
    await goToMethodStep(user)
    await user.click(screen.getByRole('radio', { name: '통합 모집' }))
    await clickNext(user)

    await user.click(screen.getByRole('button', { name: '템플릿으로 추가' }))
    await user.click(await screen.findByRole('menuitem', { name: '포트폴리오형' }))
    expect(getQuestionCards()).toEqual([
      'Q1 자기소개를 해 주세요 편집',
      'Q2 지원 동기를 작성해 주세요 편집',
      'Q3 지원 분야와 관련된 경험을 알려 주세요 편집',
      'Q4 포트폴리오 또는 결과물을 첨부해 주세요. 편집',
      'Q5 대표 결과물에 대해 설명해 주세요. (기획 의도, 내 역할 등) 편집',
      'Q6 작업에 사용한 도구나 기술을 알려 주세요. 편집',
    ])
    await waitFor(() => expect(screen.getByRole('button', { name: /^Q4 .* 편집$/ })).toHaveFocus())
    const settings = screen.getByRole('complementary', { name: 'Q4 문항 설정' })
    expect(
      within(settings).getByText('파일이나 링크 중 하나는 꼭 제출해야 해요'),
    ).toBeInTheDocument()
    expect(screen.getByText('PDF, 이미지만 업로드 가능합니다')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '다음' })).toBeEnabled()

    await user.click(within(settings).getByRole('button', { name: 'PPT' }))
    expect(screen.getByText('PDF, 이미지, PPT만 업로드 가능합니다')).toBeInTheDocument()

    await user.click(within(settings).getByRole('checkbox', { name: '파일 업로드' }))
    expect(screen.queryByText('파일을 끌어다 놓거나 파일 선택')).not.toBeInTheDocument()
    expect(screen.queryByText(/업로드 가능합니다$/)).not.toBeInTheDocument()
    expect(screen.getByText('https:// (노션 · 깃허브 등)')).toBeInTheDocument()

    await user.click(within(settings).getByRole('checkbox', { name: 'URL 링크' }))
    expect(screen.queryByText('https:// (노션 · 깃허브 등)')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '다음' })).toBeDisabled()
  })

  it('문항 메뉴의 위로·아래로 이동으로 순서를 바꾸고, 끝 문항은 그 방향 이동 비활성', async () => {
    const user = setupWithDate()
    renderForm()
    await goToMethodStep(user)
    await user.click(screen.getByRole('radio', { name: '통합 모집' }))
    await clickNext(user)

    await user.click(screen.getByRole('button', { name: 'Q1 문항 메뉴' }))
    expect(await screen.findByRole('menuitem', { name: '위로 이동' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    await user.click(screen.getByRole('menuitem', { name: '아래로 이동' }))
    expect(getQuestionCards()).toEqual([
      'Q1 지원 동기를 작성해 주세요 편집',
      'Q2 자기소개를 해 주세요 편집',
      'Q3 지원 분야와 관련된 경험을 알려 주세요 편집',
    ])
    expect(screen.getByText('Q1 문항을 Q2 자리로 옮겼어요')).toHaveAttribute('role', 'status')
    // 옮긴 문항이 계속 선택된 상태
    expect(screen.getByRole('complementary', { name: 'Q2 문항 설정' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^Q3 / }))
    await user.click(screen.getByRole('button', { name: 'Q3 문항 메뉴' }))
    expect(await screen.findByRole('menuitem', { name: '아래로 이동' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    await user.click(screen.getByRole('menuitem', { name: '위로 이동' }))
    expect(getQuestionCards()).toEqual([
      'Q1 지원 동기를 작성해 주세요 편집',
      'Q2 지원 분야와 관련된 경험을 알려 주세요 편집',
      'Q3 자기소개를 해 주세요 편집',
    ])
  })

  it('문항 카드를 끌어 다른 문항 아래에 놓으면 그 자리로 이동', async () => {
    const user = setupWithDate()
    renderForm()
    await goToMethodStep(user)
    await user.click(screen.getByRole('radio', { name: '통합 모집' }))
    await clickNext(user)

    const [firstItem, , thirdItem] = within(
      screen.getByRole('list', { name: '지원서 문항' }),
    ).getAllByRole('listitem')
    const firstCard = firstItem?.querySelector('[draggable="true"]')
    if (!firstCard || !thirdItem) {
      throw new Error('문항 카드 없음')
    }
    // jsdom은 DragEvent가 없어 전달 데이터·포인터 위치를 직접 지정
    const dataTransfer = { setData: vi.fn(), effectAllowed: '', dropEffect: '' }
    vi.spyOn(thirdItem, 'getBoundingClientRect').mockReturnValue(
      DOMRect.fromRect({ y: 0, height: 100 }),
    )
    const dragOverLowerHalf = createEvent.dragOver(thirdItem, { dataTransfer })
    Object.defineProperty(dragOverLowerHalf, 'clientY', { value: 80 })

    fireEvent.dragStart(firstCard, { dataTransfer })
    fireEvent(thirdItem, dragOverLowerHalf)
    fireEvent.drop(thirdItem, { dataTransfer })

    expect(getQuestionCards()).toEqual([
      'Q1 지원 동기를 작성해 주세요 편집',
      'Q2 지원 분야와 관련된 경험을 알려 주세요 편집',
      'Q3 자기소개를 해 주세요 편집',
    ])
  })

  it('면접 공고는 지원서 양식 다음 면접 시간 설정, 발표일 사이 날짜와 면접 가능 기간 표시', async () => {
    const user = setupWithDate()
    renderForm(true)
    await goToMethodStep(user)
    await user.click(screen.getByRole('radio', { name: '통합 모집' }))
    await clickNext(user)
    await clickNext(user)

    expect(screen.getByRole('heading', { name: '면접 일정' })).toBeInTheDocument()
    expect(screen.getByText('면접 가능 기간: 10/23 (금) ~ 10/27 (화)')).toBeInTheDocument()
    const dateGroup = screen.getByRole('group', { name: '면접 날짜' })
    expect(within(dateGroup).getByText('10/22 (목)')).toBeInTheDocument()
    expect(within(dateGroup).getByText('10/28 (수)')).toBeInTheDocument()
    const dayButtons = within(dateGroup).getAllByRole('button')
    expect(dayButtons.map((button) => button.textContent)).toEqual([
      '금23',
      '토24',
      '일25',
      '월26',
      '화27',
    ])
    expect(screen.getByRole('button', { name: '선택 완료' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: '2026년 10월 23일 금요일' }))
    expect(screen.getByRole('button', { name: '2026년 10월 23일 금요일' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(dateGroup).toHaveTextContent('면접 날짜1 / 5일')
    expect(screen.getByRole('button', { name: '선택 완료' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: '2026년 10월 23일 금요일' }))
    expect(dateGroup).toHaveTextContent('면접 날짜0 / 5일')
    expect(screen.getByRole('button', { name: '다음' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /^면접 1회 시간/ }))
    expect((await screen.findAllByRole('menuitemradio')).map((item) => item.textContent)).toEqual([
      '15분',
      '20분',
      '30분',
      '40분',
      '60분',
    ])
    await user.click(screen.getByRole('menuitemradio', { name: '40분' }))
    expect(screen.getByRole('button', { name: /^면접 1회 시간/ })).toHaveTextContent('40분')

    await user.click(screen.getByRole('button', { name: /^쉬는 시간/ }))
    await user.click(await screen.findByRole('menuitemradio', { name: '0분' }))
    await user.click(screen.getByRole('button', { name: '2026년 10월 23일 금요일' }))
    await user.click(screen.getByRole('button', { name: '2026년 10월 26일 월요일' }))
    await user.click(screen.getByRole('button', { name: '선택 완료' }))

    expect(screen.queryByRole('group', { name: '면접 날짜' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '면접 가능 시간' })).toHaveFocus()
    const friday = screen.getByRole('group', { name: '2026년 10월 23일 금요일' })
    expect(screen.getByRole('group', { name: '2026년 10월 26일 월요일' })).toBeInTheDocument()
    expect(within(friday).getAllByRole('button')).toHaveLength(26)

    // 40분 면접은 30분 칸 2개가 이어져야 1회 가능
    for (const name of ['09:00~09:30', '09:30~10:00']) {
      within(friday).getByRole('button', { name }).focus()
      await user.keyboard('{Enter}')
    }
    expect(within(friday).getByRole('button', { name: '09:00~09:30' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(within(friday).getByText('면접 1회 가능')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^면접 1회 시간/ }))
    await user.click(await screen.findByRole('menuitemradio', { name: '30분' }))
    expect(within(friday).getByText('면접 2회 가능')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^면접당 최대 지원자 수/ }))
    await user.click(await screen.findByRole('menuitemradio', { name: '1명' }))
    await user.click(screen.getByRole('button', { name: /^같은 시간 면접실 수/ }))
    await user.click(await screen.findByRole('menuitemradio', { name: '2개' }))
    await waitFor(() => expect(screen.getByRole('button', { name: '다음' })).toBeEnabled())

    await user.click(screen.getByRole('button', { name: '날짜 수정' }))
    expect(screen.getByRole('group', { name: '면접 날짜' })).toHaveFocus()
    expect(screen.queryByRole('heading', { name: '면접 조건' })).not.toBeInTheDocument()
    // 수정 중 시간표는 흐리게 남고 조작 불가
    expect(screen.getByText('면접 가능 시간').closest('[inert]')).not.toBeNull()
    expect(screen.queryByRole('button', { name: '선택 완료' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '수정 완료' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: '2026년 10월 23일 금요일' }))
    expect(screen.getByRole('button', { name: '수정 완료' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: '취소' }))
    expect(screen.getByRole('heading', { name: '면접 가능 시간' })).toHaveFocus()
    expect(screen.getByRole('group', { name: '2026년 10월 23일 금요일' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '다음' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: '날짜 수정' }))
    await user.click(screen.getByRole('button', { name: '2026년 10월 23일 금요일' }))
    await user.click(screen.getByRole('button', { name: '2026년 10월 27일 화요일' }))
    await user.click(screen.getByRole('button', { name: '수정 완료' }))
    expect(screen.queryByRole('group', { name: '2026년 10월 23일 금요일' })).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: '2026년 10월 27일 화요일' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '다음' })).toBeDisabled()
  })

  it('비면접 통합 모집은 지원서 양식 다음 검토 및 게시, 고른 정보만 요약하고 수정으로 해당 단계 이동', async () => {
    const user = setupWithDate()
    renderForm(false)
    await goToMethodStep(user)
    await user.click(screen.getByRole('radio', { name: '통합 모집' }))
    await clickNext(user)
    await clickNext(user)

    expect(screen.getByText('게시할 준비가 끝났어요')).toBeInTheDocument()
    expect(screen.getByText(/공고 게시 시 10\/1\(목\) 00:00 부터/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '다음' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '공고 게시' })).toBeInTheDocument()

    const info = screen.getByRole('region', { name: '공고 정보' })
    expect(
      within(info)
        .getAllByRole('term')
        .map((term) => term.textContent),
    ).toEqual(['공고명', '지원 자격'])
    expect(within(info).getByText('대학생')).toBeInTheDocument()
    const schedule = screen.getByRole('region', { name: '모집 일정' })
    expect(within(schedule).getByText('모집')).toBeInTheDocument()
    expect(within(schedule).getByText('최종 발표')).toBeInTheDocument()
    expect(within(schedule).queryByText('면접')).not.toBeInTheDocument()

    expect(screen.getByRole('region', { name: '모집 방식' })).toHaveTextContent('통합 모집')
    const form = screen.getByRole('region', { name: '지원서 양식' })
    expect(within(form).queryByRole('tablist')).not.toBeInTheDocument()
    expect(within(form).queryByText('면접 가능 시간')).not.toBeInTheDocument()
    expect(within(form).getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByRole('heading', { name: 'UXUX 14기 신입 부원 모집' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '공고 게시' }))
    const publishDialog = await screen.findByRole('dialog', { name: '공고를 게시하시겠어요?' })
    expect(publishDialog).toHaveTextContent('게시 후에도 공고 관리에서 수정이 가능해요')
    expect(within(publishDialog).getByRole('button', { name: '게시하기' })).toBeInTheDocument()
    await user.click(within(publishDialog).getByRole('button', { name: '취소' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '공고 게시' })).toHaveFocus()

    await user.click(screen.getByRole('button', { name: '모집 방식 수정' }))
    expect(screen.getByRole('heading', { name: '모집 유형' })).toBeInTheDocument()
  })

  it('발표일을 바꾸고 돌아오면 면접 가능 기간 밖 날짜와 시간은 지워지고, 남은 날짜가 없으면 날짜 선택부터 표시', async () => {
    const user = setupWithDate()
    renderForm(true)
    await goToMethodStep(user)
    await user.click(screen.getByRole('radio', { name: '통합 모집' }))
    await clickNext(user)
    await clickNext(user)

    await user.click(screen.getByRole('button', { name: '2026년 10월 23일 금요일' }))
    await user.click(screen.getByRole('button', { name: '2026년 10월 26일 월요일' }))
    await user.click(screen.getByRole('button', { name: '선택 완료' }))
    within(screen.getByRole('group', { name: '2026년 10월 23일 금요일' }))
      .getByRole('button', { name: '09:00~09:30' })
      .focus()
    await user.keyboard('{Enter}')

    const pickDocumentResultDate = async (dayLabel: string) => {
      await clickStep(user, screen.getByRole('button', { name: /모집 일정$/ }))
      await user.click(screen.getByRole('button', { name: /^서류 결과 발표일/ }))
      await user.click(await screen.findByRole('button', { name: dayLabel }))
      for (let count = 0; count < 3; count += 1) {
        await clickNext(user)
      }
    }

    await pickDocumentResultDate('2026년 10월 23일 금요일')
    expect(screen.queryByRole('group', { name: '면접 날짜' })).not.toBeInTheDocument()
    expect(screen.queryByRole('group', { name: '2026년 10월 23일 금요일' })).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: '2026년 10월 26일 월요일' })).toBeInTheDocument()

    await pickDocumentResultDate('2026년 10월 26일 월요일')
    const dateGroup = screen.getByRole('group', { name: '면접 날짜' })
    expect(dateGroup).toHaveTextContent('면접 날짜0 / 5일')
    expect(screen.getByRole('button', { name: '선택 완료' })).toBeDisabled()
    expect(screen.queryByRole('heading', { name: '면접 가능 시간' })).not.toBeInTheDocument()

    // 발표일을 되돌려 같은 날짜를 다시 골라도 지워진 시간은 되살아나지 않음
    await pickDocumentResultDate('2026년 10월 22일 목요일')
    await user.click(screen.getByRole('button', { name: '2026년 10월 23일 금요일' }))
    await user.click(screen.getByRole('button', { name: '선택 완료' }))
    const friday = screen.getByRole('group', { name: '2026년 10월 23일 금요일' })
    expect(within(friday).getByRole('button', { name: '09:00~09:30' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('검토 단계에서 발표일을 바꿔 면접 날짜가 기간을 벗어나면 검토 단계로 바로 이동 불가', async () => {
    const user = setupWithDate()
    renderForm(true)
    await goToMethodStep(user)
    await user.click(screen.getByRole('radio', { name: '통합 모집' }))
    await clickNext(user)
    await clickNext(user)

    const pickMenuItem = async (trigger: RegExp, item: string) => {
      await user.click(screen.getByRole('button', { name: trigger }))
      await user.click(await screen.findByRole('menuitemradio', { name: item }))
    }
    await pickMenuItem(/^면접 1회 시간/, '30분')
    await pickMenuItem(/^쉬는 시간/, '0분')
    await user.click(screen.getByRole('button', { name: '2026년 10월 23일 금요일' }))
    await user.click(screen.getByRole('button', { name: '선택 완료' }))
    within(screen.getByRole('group', { name: '2026년 10월 23일 금요일' }))
      .getByRole('button', { name: '09:00~09:30' })
      .focus()
    await user.keyboard('{Enter}')
    await pickMenuItem(/^면접당 최대 지원자 수/, '1명')
    await pickMenuItem(/^같은 시간 면접실 수/, '2개')
    await clickNext(user)
    expect(screen.getByRole('button', { name: '공고 게시' })).toBeInTheDocument()

    await clickStep(user, screen.getByRole('button', { name: /모집 일정$/ }))
    expect(screen.getByRole('button', { name: /검토 및 게시$/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^서류 결과 발표일/ }))
    await user.click(await screen.findByRole('button', { name: '2026년 10월 23일 금요일' }))

    expect(screen.queryByRole('button', { name: /검토 및 게시$/ })).not.toBeInTheDocument()
    await clickStep(user, screen.getByRole('button', { name: /면접 시간 설정$/ }))
    expect(screen.getByRole('group', { name: '면접 날짜' })).toHaveTextContent('면접 날짜0 / 5일')
  })

  it('포지션별 모집은 포지션마다 탭과 문항을 따로 관리', async () => {
    const user = setupWithDate()
    renderForm(false)
    await goToMethodStep(user)
    await user.click(screen.getByRole('radio', { name: '포지션별 모집' }))
    await addPosition(user, '디자인팀')
    await addPosition(user, '개발팀')
    await clickNext(user)

    expect(screen.getByRole('tab', { name: '디자인팀' })).toHaveAttribute('aria-selected', 'true')
    await user.click(screen.getByRole('button', { name: '파일 또는 URL 문항 추가' }))
    expect(getQuestionCards()).toHaveLength(4)

    await user.click(screen.getByRole('tab', { name: '개발팀' }))
    expect(getQuestionCards()).toHaveLength(3)

    await user.click(screen.getByRole('tab', { name: '디자인팀' }))
    expect(getQuestionCards()).toHaveLength(4)
  })

  it('포지션을 삭제하면 그 포지션의 문항도 함께 지워지고 남은 포지션 문항은 유지', async () => {
    const user = setupWithDate()
    renderForm(false)
    await goToMethodStep(user)
    await user.click(screen.getByRole('radio', { name: '포지션별 모집' }))
    await addPosition(user, '디자인팀')
    await addPosition(user, '개발팀')
    await clickNext(user)
    await user.click(screen.getByRole('button', { name: '파일 또는 URL 문항 추가' }))
    expect(getQuestionCards()).toHaveLength(4)

    await clickStep(user, screen.getByRole('button', { name: /모집 방식/ }))
    await user.click(screen.getByRole('button', { name: '디자인팀 삭제' }))
    await clickNext(user)

    expect(screen.getByRole('tab', { name: '개발팀' })).toHaveAttribute('aria-selected', 'true')
    expect(getQuestionCards()).toHaveLength(3)
  })

  it('게시하면 완료 안내 후 게시한 공고 관리 화면으로 이동', async () => {
    const user = setupWithDate()
    renderForm(false)
    await goToReviewStep(user)

    await confirmPublish(user)

    expect(await screen.findByText('공고를 게시했어요')).toBeInTheDocument()
    expect(push).toHaveBeenCalledWith('/manage/postings/draft-1')
  })

  it('뒤로가기로 고치고 앞으로가기로 돌아와 게시하면 고친 단계를 저장한 뒤 게시', async () => {
    const user = setupWithDate()
    renderForm(false)
    await goToReviewStep(user)
    const requests = recordPostingRequests()

    window.history.back()
    await user.click(await screen.findByRole('button', { name: /^Q2 / }))
    const titleInput = within(
      screen.getByRole('complementary', { name: 'Q2 문항 설정' }),
    ).getByRole('textbox', { name: /질문/ })
    await user.clear(titleInput)
    await user.type(titleInput, '가장 몰입했던 경험')
    window.history.forward()
    expect(await screen.findByRole('button', { name: '공고 게시' })).toBeInTheDocument()
    expect(requests).toEqual([])

    await confirmPublish(user)

    expect(await screen.findByText('공고를 게시했어요')).toBeInTheDocument()
    expect(requests.map(({ operation }) => operation)).toEqual([
      'SavePostingDraft',
      'PublishPosting',
    ])
    expect(requests[0]?.questionTitles).toContain('가장 몰입했던 경험')
  })

  it('뒤로가기로 떠난 단계도 임시 저장에 포함', async () => {
    const user = setupWithDate()
    renderForm(false)
    await goToReviewStep(user)
    const requests = recordPostingRequests()

    window.history.back()
    await screen.findByRole('button', { name: /^Q2 / })
    window.history.back()
    expect(await screen.findByRole('heading', { name: '모집 유형' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '임시 저장' }))

    expect(await screen.findByText('임시 저장되었습니다')).toBeInTheDocument()
    expect(requests).toHaveLength(2)
  })

  it('서버 게시 검사에 걸리면 팝업을 닫고 해당 단계로 이동해 안내', async () => {
    server.use(
      publishError('POSTING_400', [
        { field: 'questionsStep', message: '지원서 문항을 1개 이상 추가해주세요.' },
      ]),
    )
    const user = setupWithDate()
    renderForm(false)
    await goToReviewStep(user)

    await confirmPublish(user)

    expect(await screen.findByText('게시하기 전에 확인해 주세요')).toBeInTheDocument()
    expect(screen.getByText('지원서 문항을 1개 이상 추가해주세요.')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText(/지원서 양식/, { selector: 'li span' }).closest('li')).toHaveAttribute(
      'aria-current',
      'step',
    )
    expect(push).not.toHaveBeenCalled()
  })

  it('이용권이 없으면 안내하고 검토 단계에 머묾', async () => {
    server.use(publishError('ORG_402'))
    const user = setupWithDate()
    renderForm(false)
    await goToReviewStep(user)

    await confirmPublish(user)

    expect(await screen.findByText('이용권이 있어야 공고를 게시할 수 있어요')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '공고 게시' })).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
  })
})
