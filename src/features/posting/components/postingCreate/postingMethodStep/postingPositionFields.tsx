'use client'

import { useId } from 'react'
import { useFieldArray, type Control } from 'react-hook-form'
import CloseIcon from '@/assets/icons/close.svg'
import PlusIcon from '@/assets/icons/plus.svg'
import { Button } from '@/components/ui/Button/button'
import { InlineNotice } from '@/components/ui/InlineNotice/inlineNotice'
import type { PostingCreateValues } from '@/features/posting/schemas/postingCreateValues'
import { PostingPositionAddDialog } from './postingPositionAddDialog'

type PostingPositionFieldsProps = {
  control: Control<PostingCreateValues>
}

// TODO: 팀 설정 포지션 조회 API 연결 후 등록된 포지션이 있으면 불러오기 화면 표시
function PostingPositionFields({ control }: PostingPositionFieldsProps) {
  const titleId = useId()
  const { fields, append, remove } = useFieldArray({ control, name: 'positions' })
  const { remove: removeQuestionSet } = useFieldArray({ control, name: 'questionSets' })
  const positionNames = fields.map((field) => field.name)

  function handleAdd(name: string) {
    append({ name })
  }

  // 문항 묶음은 포지션 순서로 짝지어져 같은 위치도 함께 삭제
  function handleRemove(index: number) {
    remove(index)
    removeQuestionSet(index)
  }

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-gap-xl">
      <div className="flex flex-col gap-gap-s">
        <h2 id={titleId} className="text-heading2 font-semibold text-neutral">
          모집 포지션
        </h2>
        <InlineNotice tone="critical">팀 설정에 등록된 포지션이 없어요</InlineNotice>
      </div>
      {fields.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-gap-s rounded-l bg-neutral-weak p-padding-xxl">
          <p className="text-body2 font-normal text-neutral-muted">추가한 포지션이 없어요</p>
          <PostingPositionAddDialog existingNames={positionNames} onAdd={handleAdd}>
            <Button variant="secondary" size="s">
              <PlusIcon aria-hidden />
              포지션 추가
            </Button>
          </PostingPositionAddDialog>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-gap-m">
          <ul aria-labelledby={titleId} className="flex w-full flex-col gap-gap-m">
            {fields.map((field, index) => (
              <li
                key={field.id}
                className="flex items-center gap-gap-m rounded-l bg-layer-basement px-padding-m py-padding-s"
              >
                <span className="min-w-0 flex-1 text-body1 font-semibold break-words text-neutral">
                  {field.name}
                </span>
                <button
                  type="button"
                  aria-label={`${field.name} 삭제`}
                  onClick={() => handleRemove(index)}
                  className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-s text-neutral outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
                >
                  <CloseIcon aria-hidden className="size-4.5" />
                </button>
              </li>
            ))}
          </ul>
          <PostingPositionAddDialog existingNames={positionNames} onAdd={handleAdd}>
            <Button variant="tertiary" size="s">
              <PlusIcon aria-hidden className="text-neutral" />
              포지션 추가
            </Button>
          </PostingPositionAddDialog>
        </div>
      )}
    </section>
  )
}

export { PostingPositionFields }
