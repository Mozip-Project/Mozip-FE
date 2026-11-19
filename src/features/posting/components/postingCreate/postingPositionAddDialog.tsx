'use client'

import { useLayoutEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/Dialog/dialog'
import { TextField } from '@/components/ui/TextField/textField'

type PostingPositionAddDialogProps = {
  onAdd: (name: string) => void
  children: ReactNode
}

function PostingPositionAddDialog({ onAdd, children }: PostingPositionAddDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const trimmedName = name.trim()

  // 이동 시 숨겨 보관되는 페이지(cacheComponents)로 돌아왔을 때 열린 채 남는 것 방지
  useLayoutEffect(() => {
    return () => {
      setIsOpen(false)
      setName('')
    }
  }, [])

  function handleOpenChange(nextOpen: boolean) {
    setIsOpen(nextOpen)
    if (!nextOpen) {
      setName('')
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!trimmedName) {
      return
    }
    onAdd(trimmedName)
    handleOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader title="추가할 포지션을 입력해 주세요" />
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-gap-xl">
          <TextField
            aria-label="포지션"
            placeholder="포지션을 입력해 주세요"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">취소</Button>
            </DialogClose>
            <Button type="submit" disabled={!trimmedName}>
              추가하기
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { PostingPositionAddDialog }
