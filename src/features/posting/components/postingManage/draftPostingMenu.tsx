'use client'

import { useRef } from 'react'
import TrashIcon from '@/assets/icons/trash.svg'
import { ActionMenu } from '@/components/ui/ActionMenu/actionMenu'
import { DropdownMenuItem } from '@/components/ui/DropdownMenu/dropdownMenu'
import { useDeleteManagedPostingMutation } from '@/features/posting/hooks/useManagedPostings'

// Figma 기준 ⋯ 버튼 바로 아래 1px
const MENU_SIDE_OFFSET_PX = 1

type DraftPostingMenuProps = {
  postingId: string
  title: string
}

// TODO: 삭제 확인·실패 안내 디자인 확정 후 반영, 현재 Figma는 누르면 바로 삭제
function DraftPostingMenu({ postingId, title }: DraftPostingMenuProps) {
  const anchorRef = useRef<HTMLDivElement>(null)
  // 삭제로 메뉴 버튼이 사라지면 같은 탭으로 focus 이동
  const deletedTabRef = useRef<HTMLElement | null>(null)
  const { mutate: deletePosting } = useDeleteManagedPostingMutation()

  function handleDelete() {
    const panel = anchorRef.current?.closest('[role=tabpanel]')
    const tabId = panel?.getAttribute('aria-labelledby')
    deletedTabRef.current = tabId ? document.getElementById(tabId) : null
    deletePosting(postingId)
  }

  return (
    <div ref={anchorRef} className="contents">
      <ActionMenu
        label={`${title} 메뉴`}
        sideOffset={MENU_SIDE_OFFSET_PX}
        onCloseAutoFocus={(event) => {
          if (deletedTabRef.current) {
            event.preventDefault()
            deletedTabRef.current.focus()
          }
        }}
      >
        <DropdownMenuItem onSelect={handleDelete}>
          <TrashIcon aria-hidden />
          공고 삭제
        </DropdownMenuItem>
      </ActionMenu>
    </div>
  )
}

export { DraftPostingMenu }
