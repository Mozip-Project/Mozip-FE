import { afterEach, describe, expect, it, vi } from 'vitest'
import { scrollToStickyBarTop } from '@/components/ui/StickyTopBar/stickyTopBar'

const SCROLL_Y_PX = 1000
const CONTAINER_TOP_PX = -500
// GNB 표시 전환 중인 바의 중간 위치
const TRANSITIONING_BAR_TOP_PX = 60

function setUpStuckBar({ isGnbRevealed }: { isGnbRevealed: boolean }) {
  const gnb = document.createElement('header')
  gnb.dataset.slot = 'gnb'
  if (isGnbRevealed) {
    gnb.dataset.revealed = ''
  }
  const container = document.createElement('div')
  const bar = document.createElement('div')
  bar.dataset.stickyTopBar = ''
  container.append(bar)
  document.body.append(gnb, container)

  vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
    top: CONTAINER_TOP_PX,
  } as DOMRect)
  vi.spyOn(bar, 'getBoundingClientRect').mockReturnValue({
    top: TRANSITIONING_BAR_TOP_PX,
  } as DOMRect)
  Object.defineProperty(window, 'scrollY', { value: SCROLL_Y_PX, configurable: true })

  return container
}

describe('scrollToStickyBarTop', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
    vi.restoreAllMocks()
  })

  it('GNB가 나오는 중이면 전환이 끝난 위치(112px)에 맞춰 스크롤', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)

    scrollToStickyBarTop(setUpStuckBar({ isGnbRevealed: true }))

    expect(scrollToSpy).toHaveBeenCalledWith({
      top: SCROLL_Y_PX + CONTAINER_TOP_PX - 112,
      behavior: 'instant',
    })
  })

  it('GNB가 숨는 중이면 전환이 끝난 위치(48px)에 맞춰 스크롤', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)

    scrollToStickyBarTop(setUpStuckBar({ isGnbRevealed: false }))

    expect(scrollToSpy).toHaveBeenCalledWith({
      top: SCROLL_Y_PX + CONTAINER_TOP_PX - 48,
      behavior: 'instant',
    })
  })
})
