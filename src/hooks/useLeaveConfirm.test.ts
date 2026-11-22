import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useLeaveConfirm } from './useLeaveConfirm'

function appendLink(href: string, attributes: Record<string, string> = {}) {
  const anchor = document.createElement('a')

  anchor.href = href
  for (const [name, value] of Object.entries(attributes)) {
    anchor.setAttribute(name, value)
  }
  anchor.textContent = '링크'
  document.body.append(anchor)
  return anchor
}

// 훅이 이동을 막고 링크까지 전달하지 않았는지 반환, 통과한 클릭은 jsdom의 실제 페이지 이동 시도만 막음
function clickLink(anchor: HTMLAnchorElement, init: MouseEventInit = {}) {
  const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init })
  let hasReachedLink = false

  anchor.addEventListener(
    'click',
    (linkEvent) => {
      hasReachedLink = true
      linkEvent.preventDefault()
    },
    { once: true },
  )
  act(() => {
    anchor.dispatchEvent(event)
  })
  return event.defaultPrevented && !hasReachedLink
}

describe('useLeaveConfirm', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('앱 안 다른 주소 링크는 이동을 막고 주소를 보관', () => {
    const { result } = renderHook(() => useLeaveConfirm(true))
    const wasIntercepted = clickLink(appendLink('/postings/uxux-14?tab=info#top'))

    expect(wasIntercepted).toBe(true)
    expect(result.current.pendingHref).toBe('/postings/uxux-14?tab=info#top')
  })

  it('취소하면 보관한 주소를 비움', () => {
    const { result } = renderHook(() => useLeaveConfirm(true))

    clickLink(appendLink('/postings'))
    act(() => result.current.cancelLeave())

    expect(result.current.pendingHref).toBeNull()
  })

  it('확인이 필요 없으면 막지 않음', () => {
    const { result } = renderHook(() => useLeaveConfirm(false))
    const wasIntercepted = clickLink(appendLink('/postings'))

    expect(wasIntercepted).toBe(false)
    expect(result.current.pendingHref).toBeNull()
  })

  it('새 탭·다운로드·외부 주소·같은 화면 링크는 막지 않음', () => {
    const { result } = renderHook(() => useLeaveConfirm(true))
    const ignoredClicks = [
      clickLink(appendLink('/postings'), { metaKey: true }),
      clickLink(appendLink('/postings', { target: '_blank' })),
      clickLink(appendLink('/files/guide.pdf', { download: '' })),
      clickLink(appendLink('https://example.com/postings')),
      clickLink(appendLink(`${window.location.pathname}${window.location.search}#section`)),
    ]

    expect(ignoredClicks).toEqual([false, false, false, false, false])
    expect(result.current.pendingHref).toBeNull()
  })

  it('확인이 필요할 때만 페이지를 떠나기 전 브라우저 확인 창 요청', () => {
    const { rerender } = renderHook(({ shouldConfirm }) => useLeaveConfirm(shouldConfirm), {
      initialProps: { shouldConfirm: true },
    })
    const confirmedEvent = new Event('beforeunload', { cancelable: true })

    window.dispatchEvent(confirmedEvent)
    rerender({ shouldConfirm: false })
    const releasedEvent = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(releasedEvent)

    expect(confirmedEvent.defaultPrevented).toBe(true)
    expect(releasedEvent.defaultPrevented).toBe(false)
  })
})
