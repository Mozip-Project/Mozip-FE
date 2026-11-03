import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Button } from '@/components/ui/Button/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogProgress,
  DialogTrigger,
} from '@/components/ui/Dialog/dialog'

function renderDialog() {
  render(
    <Dialog>
      <DialogTrigger asChild>
        <Button>열기</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader title="평가를 마쳤어요" description="마감 전까지 수정할 수 있어요" />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">닫기</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>,
  )
}

describe('Dialog', () => {
  it('제목과 설명을 접근 가능한 이름·설명으로 연결', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: '열기' }))

    const dialog = screen.getByRole('dialog', { name: '평가를 마쳤어요' })
    expect(dialog).toHaveAccessibleDescription('마감 전까지 수정할 수 있어요')
    expect(dialog).toContainElement(document.activeElement as HTMLElement)
  })

  it('Esc로 닫히면 연 버튼으로 focus 복귀', async () => {
    const user = userEvent.setup()
    renderDialog()
    const trigger = screen.getByRole('button', { name: '열기' })

    await user.click(trigger)
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('닫기 버튼으로 닫기', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: '열기' }))
    await user.click(screen.getByRole('button', { name: '닫기' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('DialogProgress', () => {
  it('진행 상태를 progressbar로 전달', () => {
    render(<DialogProgress label="메일 발송" valueText="31 / 48명" value={31} max={48} />)

    const progress = screen.getByRole('progressbar', { name: '메일 발송' })
    expect(progress).toHaveAttribute('aria-valuenow', '31')
    expect(progress).toHaveAttribute('aria-valuemax', '48')
    expect(progress).toHaveAttribute('aria-valuetext', '31 / 48명')
  })
})
