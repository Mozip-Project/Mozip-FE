import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApplicantChipStrip } from '@/components/ui/ApplicantChipStrip/applicantChipStrip'

const APPLICANTS = [
  { id: '1', name: '송유진', isDone: true },
  { id: '2', name: '김모집', isDone: false },
  { id: '3', name: '오하늘', isDone: false },
]

// jsdom 레이아웃 대체값
const LIST_WIDTH_PX = 1000
const VIEWPORT_WIDTH_PX = 500
const ITEM_STEP_PX = 208

function getList() {
  return screen.getByRole('list')
}

describe('ApplicantChipStrip', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        disconnect() {}
      },
    )
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(LIST_WIDTH_PX)
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(VIEWPORT_WIDTH_PX)
    vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      const siblings = this.parentElement ? [...this.parentElement.children] : []
      return this.tagName === 'LI' ? siblings.indexOf(this) * ITEM_STEP_PX : 0
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('칩 클릭 시 해당 지원자 선택', async () => {
    const user = userEvent.setup()
    const handleSelect = vi.fn()
    render(
      <ApplicantChipStrip
        label="지원자 목록"
        applicants={APPLICANTS}
        currentId="1"
        onSelect={handleSelect}
      />,
    )

    await user.click(screen.getByRole('button', { name: '오하늘' }))

    expect(handleSelect).toHaveBeenCalledWith('3')
    expect(screen.getByRole('button', { name: '송유진 평가 완료' })).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  it('연속 클릭 시 이동량을 누적하고 끝에서 정지', async () => {
    const user = userEvent.setup()
    render(
      <ApplicantChipStrip
        label="지원자 목록"
        applicants={APPLICANTS}
        currentId="1"
        onSelect={vi.fn()}
      />,
    )
    const prevButton = screen.getByRole('button', { name: '이전 지원자 보기' })
    const nextButton = screen.getByRole('button', { name: '다음 지원자 보기' })

    expect(prevButton).toBeDisabled()

    await user.click(nextButton)
    await user.click(nextButton)
    expect(getList()).toHaveStyle({ transform: 'translateX(-416px)' })

    await user.click(nextButton)
    await user.click(nextButton)
    expect(getList()).toHaveStyle({ transform: 'translateX(-500px)' })
    expect(nextButton).toBeDisabled()
    expect(prevButton).toBeEnabled()
  })
})
