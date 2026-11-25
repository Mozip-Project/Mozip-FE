'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useLayoutEffect, useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
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
import {
  createPositionNameSchema,
  POSITION_NAME_MAX_LENGTH,
  type PositionNameValues,
} from '@/features/posting/schemas/postingMethodSchema'

const EMPTY_POSITION_NAME = { name: '' } satisfies PositionNameValues

type PostingPositionAddDialogProps = {
  existingNames: string[]
  onAdd: (name: string) => void
  children: ReactNode
}

function PostingPositionAddDialog({
  existingNames,
  onAdd,
  children,
}: PostingPositionAddDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid, errors },
  } = useForm<PositionNameValues>({
    resolver: zodResolver(createPositionNameSchema(existingNames)),
    defaultValues: EMPTY_POSITION_NAME,
    mode: 'onChange',
  })

  // 이동 시 숨겨 보관되는 페이지(cacheComponents)로 돌아왔을 때 열린 채 남는 것 방지
  useLayoutEffect(() => {
    return () => {
      setIsOpen(false)
      reset(EMPTY_POSITION_NAME)
    }
  }, [reset])

  function handleOpenChange(nextOpen: boolean) {
    setIsOpen(nextOpen)
    if (!nextOpen) {
      reset(EMPTY_POSITION_NAME)
    }
  }

  function handleAdd({ name }: PositionNameValues) {
    onAdd(name)
    handleOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader title="추가할 포지션을 입력해 주세요" />
        <form onSubmit={handleSubmit(handleAdd)} className="flex w-full flex-col gap-gap-xl">
          <TextField
            aria-label="포지션"
            placeholder="포지션을 입력해 주세요"
            maxLength={POSITION_NAME_MAX_LENGTH}
            aria-invalid={errors.name !== undefined}
            helper={errors.name?.message}
            {...register('name')}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">취소</Button>
            </DialogClose>
            <Button type="submit" disabled={!isValid}>
              추가하기
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { PostingPositionAddDialog }
