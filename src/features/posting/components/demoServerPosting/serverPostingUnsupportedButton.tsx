'use client'

import { Button } from '@/components/ui/Button/button'
import { SERVER_POSTING_UNSUPPORTED_TOAST } from '@/features/posting/utils/demoServerPosting'
import { useToast } from '@/providers/toastProvider'
import type { ComponentProps } from 'react'

type ServerPostingUnsupportedButtonProps = Pick<
  ComponentProps<typeof Button>,
  'variant' | 'size' | 'aria-label' | 'children'
>

// 시연 모드의 실서버 공고에서 서버에 없는 기능 버튼, 누르면 샘플 공고로 확인하라는 안내 (전시회 후 삭제)
function ServerPostingUnsupportedButton(props: ServerPostingUnsupportedButtonProps) {
  const { showToast } = useToast()

  return <Button {...props} onClick={() => showToast(SERVER_POSTING_UNSUPPORTED_TOAST)} />
}

export { ServerPostingUnsupportedButton }
