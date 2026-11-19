'use client'

import LinkIcon from '@/assets/icons/link.svg'
import type { FileRule } from '@/utils/file'
import { FileUpload } from './fileUpload'

type FileAnswerPreviewProps = FileRule & {
  fileDescription: string
  guide?: string
}

function ignoreFileEvent() {}

function FileAnswerPreview({
  acceptedTypes,
  maxSizeBytes,
  fileDescription,
  guide,
}: FileAnswerPreviewProps) {
  return (
    <>
      <div className="flex flex-col gap-gap-s">
        <FileUpload
          acceptedTypes={acceptedTypes}
          maxSizeBytes={maxSizeBytes}
          description={fileDescription}
          onFileSelect={ignoreFileEvent}
          onReject={ignoreFileEvent}
          className="border-neutral-subtle"
        />
        {guide && <p className="text-label1 font-normal text-neutral-subtle">{guide}</p>}
      </div>
      <div className="flex gap-gap-s">
        <div className="flex h-12 min-w-0 flex-1 items-center gap-gap-s rounded-m border border-neutral-muted bg-layer-default px-padding-m">
          <LinkIcon aria-hidden className="size-5 shrink-0 text-neutral-subtle" />
          <span className="truncate text-body2 font-normal text-placeholder">
            https:// 링크를 붙여 넣어 주세요
          </span>
        </div>
        <span className="flex h-12 shrink-0 items-center rounded-m bg-neutral-weak px-padding-l text-label1 font-semibold text-neutral">
          추가
        </span>
      </div>
    </>
  )
}

export { FileAnswerPreview }
export type { FileAnswerPreviewProps }
