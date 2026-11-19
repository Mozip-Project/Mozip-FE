import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider } from '@/providers/toastProvider'
import { PostingCreateForm } from './postingCreateForm'

// jsdom 미지원
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const IMAGE_FILE = new File(['image'], 'main.png', { type: 'image/png' })

function renderForm(hasInterview = true) {
  render(
    <ToastProvider>
      <PostingCreateForm hasInterview={hasInterview} />
    </ToastProvider>,
  )
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

async function goToMethodStep(user: ReturnType<typeof userEvent.setup>) {
  await fillInfoStep(user)
  await user.click(screen.getByRole('button', { name: '다음' }))

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
    name: /^서류 결과 및 면접 일정 발표일/,
  })
  if (documentResultDate) {
    await pickDate(documentResultDate, '2026년 10월 22일 목요일')
  }
  await pickDate(
    screen.getByRole('button', { name: /^최종 결과 발표일/ }),
    '2026년 10월 28일 수요일',
  )
  await waitFor(() => expect(screen.getByRole('button', { name: '다음' })).toBeEnabled())
  await user.click(screen.getByRole('button', { name: '다음' }))
}

describe('PostingCreateForm', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverStub)
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:main-image')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    // jsdom 미지원
    Element.prototype.scrollIntoView = vi.fn()
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

  it('JPG·PNG가 아닌 파일은 올리지 않고 안내', async () => {
    const user = userEvent.setup({ applyAccept: false })
    renderForm()

    await user.upload(getFileInput(), new File(['pdf'], 'doc.pdf', { type: 'application/pdf' }))

    expect(await screen.findByText('JPG, PNG 이미지만 업로드 가능해요')).toBeInTheDocument()
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

  it('임시 저장을 누르면 저장 시각 표시와 안내 토스트', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: '임시 저장' }))

    expect(await screen.findByText('임시 저장되었습니다')).toBeInTheDocument()
    expect(screen.getByText('공고 관리 탭에서 언제든 이어 쓸 수 있어요')).toBeInTheDocument()
    expect(screen.getByText('저장 완료')).toBeInTheDocument()
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
      await user.click(screen.getByRole('button', { name: '다음' }))

      expect(screen.getByRole('heading', { name: '모집 일정' })).toBeInTheDocument()
      expect(screen.getByText(/모집 일정/, { selector: 'li span' }).closest('li')).toHaveAttribute(
        'aria-current',
        'step',
      )
      expect(screen.getByRole('group', { name: '모집 시작 필수' })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: '모집 마감 필수' })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: '활동 기간' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /서류 결과 및 면접 일정 발표일/ }) !== null).toBe(
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
    expect(screen.getByRole('radio', { name: '통합 모집' })).toBeChecked()
    // TODO: 지원서 양식 단계 구현 후 다음 활성 확인
    expect(screen.getByRole('button', { name: '다음' })).toBeDisabled()
    // 현재·아직 가지 않은 단계는 이동 불가, 돌아가도 입력값 유지
    const stepList = screen.getByRole('list', { name: '공고 작성 단계' })
    expect(within(stepList).queryByRole('button', { name: /모집 방식/ })).not.toBeInTheDocument()
    expect(within(stepList).queryByRole('button', { name: /지원서 양식/ })).not.toBeInTheDocument()
    await user.click(within(stepList).getByRole('button', { name: /공고 정보/ }))
    const titleInput = screen.getByRole('textbox', { name: /공고 제목/ })
    expect(titleInput).toHaveValue('UXUX 14기 신입 부원 모집')

    // 다녀온 단계까지는 다시 이동, 앞 단계 입력이 비면 건너뛰기 불가
    expect(within(stepList).getByRole('button', { name: /모집 일정/ })).toBeInTheDocument()
    expect(within(stepList).getByRole('button', { name: /모집 방식/ })).toBeInTheDocument()
    expect(within(stepList).queryByRole('button', { name: /지원서 양식/ })).not.toBeInTheDocument()
    await user.clear(titleInput)
    expect(within(stepList).queryByRole('button')).not.toBeInTheDocument()
    await user.type(titleInput, '새 제목')
    await user.click(within(stepList).getByRole('button', { name: /모집 방식/ }))
    expect(screen.getByRole('radio', { name: '통합 모집' })).toBeChecked()
  })
})
