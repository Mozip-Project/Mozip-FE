import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { InfoPopover } from '@/components/ui/InfoPopover/infoPopover'

function renderInfoPopover() {
  render(
    <InfoPopover
      trigger={<button type="button">권한 보기</button>}
      title="권한 안내"
      description="설명"
    />,
  )
  return { trigger: screen.getByRole('button', { name: '권한 보기' }) }
}

describe('InfoPopover', () => {
  it('트리거 클릭 시 제목과 설명이 연결된 dialog 표시', async () => {
    const user = userEvent.setup()
    const { trigger } = renderInfoPopover()

    await user.click(trigger)

    const dialog = screen.getByRole('dialog', { name: '권한 안내' })
    expect(dialog).toHaveAccessibleDescription('설명')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('Esc로 닫히고 트리거로 focus 복귀', async () => {
    const user = userEvent.setup()
    const { trigger } = renderInfoPopover()

    await user.click(trigger)
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('닫기 버튼으로 닫힘', async () => {
    const user = userEvent.setup()
    const { trigger } = renderInfoPopover()

    await user.click(trigger)
    await user.click(screen.getByRole('button', { name: '닫기' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
})
