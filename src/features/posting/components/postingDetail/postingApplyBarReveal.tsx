'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

// utilities.css의 --gnb-height, 다시 나온 GNB에 가려진 버튼도 안 보이는 것으로 판정
const GNB_HEIGHT_PX = 64

type PostingApplyBarRevealProps = {
  // 이 요소가 화면 밖으로 나가면 표시
  targetId: string
  children: ReactNode
}

// 숨김 중에도 자리는 유지, 페이지 끝 신고하기 줄을 가리지 않는 여백 확보
function PostingApplyBarReveal({ targetId, children }: PostingApplyBarRevealProps) {
  const [isTargetHidden, setIsTargetHidden] = useState(false)

  useEffect(() => {
    const target = document.getElementById(targetId)

    if (!target) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const latestEntry = entries.at(-1)

        if (latestEntry) {
          setIsTargetHidden(!latestEntry.isIntersecting)
        }
      },
      { rootMargin: `-${GNB_HEIGHT_PX}px 0px 0px 0px` },
    )

    observer.observe(target)

    return () => observer.disconnect()
  }, [targetId])

  return (
    <div
      // 페이드 + 8px 이동, 바뀐 뒤 상태의 duration 적용이라 나타날 때 0.3초 · 사라질 때 0.2초
      className={cn(
        'page-bottom-bar [--bottom-bar-offset:var(--spacing-gap-xl)]',
        'transition-[opacity,translate,visibility] duration-300 ease-out motion-reduce:transition-none',
        !isTargetHidden && 'invisible translate-y-2 opacity-0 duration-200',
      )}
    >
      {children}
    </div>
  )
}

export { PostingApplyBarReveal }
