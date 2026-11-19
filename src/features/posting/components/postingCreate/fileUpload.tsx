'use client'

import UploadIcon from '@/assets/icons/upload.svg'
import { cn } from '@/lib/utils'
import { getFileRejection, type FileRejection, type FileRule } from '@/utils/file'
import type { ChangeEvent, DragEvent } from 'react'

type FileUploadProps = FileRule & {
  description: string
  onFileSelect: (file: File) => void
  onReject: (rejection: FileRejection) => void
  label?: string
  className?: string
}

function FileUpload({
  acceptedTypes,
  maxSizeBytes,
  description,
  onFileSelect,
  onReject,
  label = '파일을 끌어다 놓거나 파일 선택',
  className,
}: FileUploadProps) {
  function handleFile(file: File | undefined) {
    if (!file) {
      return
    }
    const rejection = getFileRejection(file, { acceptedTypes, maxSizeBytes })

    if (rejection) {
      onReject(rejection)
      return
    }
    onFileSelect(file)
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // 같은 파일을 다시 골라도 change 발생
    event.target.value = ''
    handleFile(file)
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    handleFile(event.dataTransfer.files[0])
  }

  return (
    <label
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      className={cn(
        'flex w-full cursor-pointer flex-col items-center justify-center gap-gap-s rounded-l border border-dashed border-neutral-muted bg-neutral-weak p-padding-l text-center break-keep',
        'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus-ring has-focus-visible:outline-solid',
        className,
      )}
    >
      <UploadIcon aria-hidden className="size-5 shrink-0 text-brand" />
      <span className="flex flex-col items-center gap-gap-xxs">
        <span className="text-label1 font-medium text-neutral">{label}</span>
        <span className="text-caption1 font-normal text-neutral-subtle">{description}</span>
      </span>
      <input
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleInputChange}
        className="sr-only"
      />
    </label>
  )
}

export { FileUpload }
export type { FileUploadProps }
