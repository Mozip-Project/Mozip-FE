'use client'

import { useEffect, useState } from 'react'

// 새 탭·다운로드·외부 주소·같은 화면 안 이동은 가로채지 않음
function getLeavingHref(event: MouseEvent) {
  const isPlainClick =
    event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
  const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null

  if (event.defaultPrevented || !isPlainClick || !(anchor instanceof HTMLAnchorElement)) {
    return null
  }
  if ((anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download')) {
    return null
  }

  const url = new URL(anchor.href)
  const isSamePage =
    url.pathname === window.location.pathname && url.search === window.location.search

  if (url.origin !== window.location.origin || isSamePage) {
    return null
  }
  return `${url.pathname}${url.search}${url.hash}`
}

// 앱 안 링크는 확인 창을 띄울 주소로 보관, 탭 닫기·새로고침은 브라우저 기본 확인 창 사용
function useLeaveConfirm(shouldConfirm: boolean) {
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  useEffect(() => {
    if (!shouldConfirm) {
      return
    }

    // next/link의 이동보다 먼저 막도록 document 캡처 단계에서 처리
    function handleClick(event: MouseEvent) {
      const href = getLeavingHref(event)

      if (!href) {
        return
      }
      event.preventDefault()
      event.stopPropagation()
      setPendingHref(href)
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
    }

    document.addEventListener('click', handleClick, true)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('click', handleClick, true)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [shouldConfirm])

  function cancelLeave() {
    setPendingHref(null)
  }

  return { pendingHref, cancelLeave }
}

export { useLeaveConfirm }
