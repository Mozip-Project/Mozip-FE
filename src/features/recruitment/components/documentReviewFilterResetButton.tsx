'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button/button'
import type { Route } from 'next'

type DocumentReviewFilterResetButtonProps = {
  href: Route
}

// 현재 화면의 조건 변경이므로 링크 대신 버튼, 툴바 조건 변경과 같이 기록을 쌓지 않고 교체
function DocumentReviewFilterResetButton({ href }: DocumentReviewFilterResetButtonProps) {
  const router = useRouter()

  return (
    <Button variant="secondary" size="m" onClick={() => router.replace(href, { scroll: false })}>
      필터 초기화
    </Button>
  )
}

export { DocumentReviewFilterResetButton }
