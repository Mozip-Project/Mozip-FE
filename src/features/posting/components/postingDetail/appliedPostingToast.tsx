'use client'

import { useEffect, useRef } from 'react'
import { useToast } from '@/providers/toastProvider'

// 이미 지원한 공고에 들어올 때 한 번 안내
function AppliedPostingToast() {
  const { showToast } = useToast()
  const hasShownRef = useRef(false)

  useEffect(() => {
    if (hasShownRef.current) {
      return
    }

    hasShownRef.current = true
    showToast({ title: '이미 지원한 공고예요. 내 지원에서 확인해 주세요.' })
  }, [showToast])

  return null
}

export { AppliedPostingToast }
