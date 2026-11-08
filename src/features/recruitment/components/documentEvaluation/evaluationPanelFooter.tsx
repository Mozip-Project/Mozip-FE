import ArrowRightIcon from '@/assets/icons/arrowRight.svg'
import { Button } from '@/components/ui/Button/button'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

type EvaluationPanelFooterMode = 'next' | 'revisit'

type EvaluationPanelFooterProps = Omit<
  ComponentProps<typeof Button>,
  'children' | 'variant' | 'size' | 'asChild'
> & {
  mode: EvaluationPanelFooterMode
}

function EvaluationPanelFooter({ mode, className, ...props }: EvaluationPanelFooterProps) {
  if (mode === 'revisit') {
    return (
      <Button variant="secondary" className={cn('w-full', className)} {...props}>
        수정 내용 저장
      </Button>
    )
  }

  return (
    <Button className={cn('w-full', className)} {...props}>
      저장하고 다음 지원자 보기
      <ArrowRightIcon aria-hidden />
    </Button>
  )
}

export { EvaluationPanelFooter }
