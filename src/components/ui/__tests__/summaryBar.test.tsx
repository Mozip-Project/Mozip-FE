import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SummaryBar } from '@/components/ui/SummaryBar/summaryBar'

describe('SummaryBar', () => {
  it('기본값은 문구를 status로 알림', () => {
    render(
      <SummaryBar status="ready" actions={null}>
        결과를 확정할 수 있어요
      </SummaryBar>,
    )

    expect(screen.getByRole('status')).toHaveTextContent('결과를 확정할 수 있어요')
  })

  it('shouldAnnounce가 false면 status 없이 문구만 표시', () => {
    render(
      <SummaryBar status="ready" actions={null} shouldAnnounce={false}>
        10/18 (일)까지 서류 결과를 안내해 주세요
      </SummaryBar>,
    )

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByText('10/18 (일)까지 서류 결과를 안내해 주세요')).toBeInTheDocument()
  })
})
