'use client'

import { useRef } from 'react'
import { flushSync } from 'react-dom'
import { Controller, useFieldArray, type Control } from 'react-hook-form'
import CloseIcon from '@/assets/icons/close.svg'
import PlusIcon from '@/assets/icons/plus.svg'
import { Button } from '@/components/ui/Button/button'
import { TextField } from '@/components/ui/TextField/textField'
import type { OrganizationProfileValues } from '@/features/organization/schemas/organizationProfileSchema'

const LINK_LABEL = 'SNS/웹사이트 링크'

type LinkFieldProps = {
  control: Control<OrganizationProfileValues>
}

// TODO: 링크 최대 개수 확정 후 추가 제한
function LinkField({ control }: LinkFieldProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'links' })
  const inputRefs = useRef(new Map<string, HTMLInputElement>())
  const canRemove = fields.length > 1

  // 삭제 직후 DOM에 반영된 이전 입력란으로 포커스 이동
  function handleRemove(index: number) {
    const focusTargetId = fields[index === 0 ? 1 : index - 1]?.id
    flushSync(() => remove(index))

    if (focusTargetId) {
      inputRefs.current.get(focusTargetId)?.focus()
    }
  }

  return (
    <div className="flex flex-col gap-gap-s">
      {fields.map((item, index) => {
        const isFirst = index === 0
        const order = index + 1

        return (
          <Controller
            key={item.id}
            name={`links.${index}.url`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                ref={(element) => {
                  field.ref(element)
                  if (element) {
                    inputRefs.current.set(item.id, element)
                  } else {
                    inputRefs.current.delete(item.id)
                  }
                }}
                type="url"
                label={isFirst ? LINK_LABEL : undefined}
                aria-label={isFirst ? undefined : `${LINK_LABEL} ${order}`}
                placeholder="SNS 또는 웹사이트 링크를 입력해 주세요"
                required={isFirst}
                trailing={
                  canRemove && (
                    <button
                      type="button"
                      aria-label={`${order}번째 링크 삭제`}
                      onClick={() => handleRemove(index)}
                      // 20px 아이콘 대신 32px 터치 영역 확보
                      className="relative flex size-5 cursor-pointer items-center justify-center rounded-s text-neutral-subtle outline-none after:absolute after:-inset-1.5 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
                    >
                      <CloseIcon aria-hidden className="size-5" />
                    </button>
                  )
                }
              />
            )}
          />
        )
      })}
      <Button
        variant="tertiary"
        size="s"
        className="self-start"
        onClick={() => append({ url: '' })}
      >
        <PlusIcon aria-hidden className="size-4" />
        링크 추가
      </Button>
    </div>
  )
}

export { LinkField }
