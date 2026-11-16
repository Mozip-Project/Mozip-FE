import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu/dropdownMenu'

describe('DropdownMenuContent', () => {
  // 화면 위에 고정된 바 안 트리거로 focus 복귀 시 html scroll-padding 때문에 페이지가 위로 밀리는 문제 방지
  it('메뉴를 닫으면 스크롤 없이 트리거로 focus 복귀', async () => {
    const user = userEvent.setup()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>정렬</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>최신순</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )

    await user.click(screen.getByRole('button', { name: '정렬' }))
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus')
    await user.click(screen.getByRole('menuitem', { name: '최신순' }))

    const trigger = screen.getByRole('button', { name: '정렬' })
    await waitFor(() => expect(trigger).toHaveFocus())
    expect(focusSpy).toHaveBeenLastCalledWith({ preventScroll: true })
    focusSpy.mockRestore()
  })
})
