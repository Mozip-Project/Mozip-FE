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
    await waitFor(() => expect(screen.getByRole('button', { name: '다음' })).toBeEnabled())
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

  it('통합 모집 지원서 양식은 기본 문항 3개, 선택한 문항 설정을 고치면 카드에 바로 반영', async () => {
    const user = setupWithDate()
    renderForm()
    await goToMethodStep(user)
    await user.click(screen.getByRole('radio', { name: '통합 모집' }))
    await user.click(screen.getByRole('button', { name: '다음' }))

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
    await user.click(screen.getByRole('button', { name: '다음' }))

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

    await user.click(screen.getByRole('button', { name: '탬플릿으로 추가' }))
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

  it('포트폴리오형 템플릿을 고르면 문항이 바뀌고, 파일 문항 설정이 카드 미리보기에 반영', async () => {
    const user = setupWithDate()
    renderForm()
    await goToMethodStep(user)
    await user.click(screen.getByRole('radio', { name: '통합 모집' }))
    await user.click(screen.getByRole('button', { name: '다음' }))

    await user.click(screen.getByRole('button', { name: '탬플릿으로 추가' }))
    await user.click(await screen.findByRole('menuitem', { name: '포트폴리오형' }))
    expect(getQuestionCards()).toEqual([
      'Q1 포트폴리오 또는 결과물을 첨부해 주세요. 편집',
      'Q2 대표 결과물에 대해 설명해 주세요. (기획 의도, 내 역할 등) 편집',
      'Q3 작업에 사용한 도구나 기술을 알려 주세요. 편집',
    ])
    const settings = screen.getByRole('complementary', { name: 'Q1 문항 설정' })
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

  it('면접 공고는 지원서 양식 다음 면접 시간 설정, 발표일 사이 날짜와 면접 가능 기간 표시', async () => {
    const user = setupWithDate()
    renderForm(true)
    await goToMethodStep(user)
    await user.click(screen.getByRole('radio', { name: '통합 모집' }))
    await user.click(screen.getByRole('button', { name: '다음' }))
    await user.click(screen.getByRole('button', { name: '다음' }))

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
    // TODO: 검토 단계 구현 후 면접 조건까지 고르면 다음 활성 확인

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

    await user.click(screen.getByRole('button', { name: '날짜 수정' }))
    await user.click(screen.getByRole('button', { name: '2026년 10월 23일 금요일' }))
    await user.click(screen.getByRole('button', { name: '2026년 10월 27일 화요일' }))
    await user.click(screen.getByRole('button', { name: '수정 완료' }))
    expect(screen.queryByRole('group', { name: '2026년 10월 23일 금요일' })).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: '2026년 10월 27일 화요일' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '다음' })).toBeDisabled()
  })

  it('포지션별 모집은 포지션마다 탭과 문항을 따로 관리', async () => {
    const user = setupWithDate()
    renderForm(false)
    await goToMethodStep(user)
    await user.click(screen.getByRole('radio', { name: '포지션별 모집' }))
    await addPosition(user, '디자인팀')
    await addPosition(user, '개발팀')
    await user.click(screen.getByRole('button', { name: '다음' }))

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
    await user.click(screen.getByRole('button', { name: '다음' }))
    await user.click(screen.getByRole('button', { name: '파일 또는 URL 문항 추가' }))
    expect(getQuestionCards()).toHaveLength(4)

    await user.click(screen.getByRole('button', { name: /모집 방식/ }))
    await user.click(screen.getByRole('button', { name: '디자인팀 삭제' }))
    await user.click(screen.getByRole('button', { name: '다음' }))

    expect(screen.getByRole('tab', { name: '개발팀' })).toHaveAttribute('aria-selected', 'true')
    expect(getQuestionCards()).toHaveLength(3)
  })
})
