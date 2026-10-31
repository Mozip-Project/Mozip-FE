'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button/button'
import type { Route } from 'next'

type DocumentReviewFilterResetButtonProps = {
  href: Route
}

// 화면 안 조건 변경이라 링크 대신 버튼, 툴바처럼 기록 없이 교체
function DocumentReviewFilterResetButton({ href }: DocumentReviewFilterResetButtonProps) {
  const router = useRouter()

  return (
    <Button variant="secondary" size="m" onClick={() => router.replace(href, { scroll: false })}>
      필터 초기화
    </Button>
  )
}

export { DocumentReviewFilterResetButton }
