import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ActionMenu } from '@/components/ui/ActionMenu/actionMenu'
import { DropdownMenuItem } from '@/components/ui/DropdownMenu/dropdownMenu'

describe('ActionMenu', () => {
  it('아이콘만 있는 버튼에 대상을 포함한 이름 연결', () => {
    render(
      <ActionMenu label="UXUX 15기 운영진 추가 모집 메뉴">
        <DropdownMenuItem>공고 삭제</DropdownMenuItem>
      </ActionMenu>,
    )

    expect(
      screen.getByRole('button', { name: 'UXUX 15기 운영진 추가 모집 메뉴' }),
    ).toBeInTheDocument()
  })
})
