import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from '@/components/ui/Button/button'
import { SummaryBar } from '@/components/ui/SummaryBar/summaryBar'

describe('SummaryBar', () => {
  it('안내 문구를 status 영역으로 전달하고 액션을 함께 표시', () => {
    render(
      <SummaryBar
        status="blocked"
        actions={
          <Button size="m" disabled>
            결과 확정하기
          </Button>
        }
      >
        보류 중인 4명의 최종 결과를 선택해 주세요.
      </SummaryBar>,
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      '보류 중인 4명의 최종 결과를 선택해 주세요.',
    )
    expect(screen.getByRole('button', { name: '결과 확정하기' })).toBeDisabled()
  })
})
