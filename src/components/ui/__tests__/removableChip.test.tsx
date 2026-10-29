import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { RemovableChip } from '@/components/ui/Chip/removableChip'

function renderRemovableChip() {
  const onRemove = vi.fn()
  render(
    <RemovableChip onRemove={onRemove} removeLabel="UX 삭제">
      UX
    </RemovableChip>,
  )
  return { onRemove }
}

describe('RemovableChip', () => {
  it('삭제 버튼 클릭 시 onRemove 호출', async () => {
    const user = userEvent.setup()
    const { onRemove } = renderRemovableChip()

    await user.click(screen.getByRole('button', { name: 'UX 삭제' }))

    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('키보드로 삭제 버튼 실행', async () => {
    const user = userEvent.setup()
    const { onRemove } = renderRemovableChip()

    await user.tab()
    expect(screen.getByRole('button', { name: 'UX 삭제' })).toHaveFocus()
    await user.keyboard('{Enter}')

    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('칩 본문은 버튼이 아니고 삭제 버튼만 노출', () => {
    renderRemovableChip()

    expect(screen.getByText('UX')).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })
})
