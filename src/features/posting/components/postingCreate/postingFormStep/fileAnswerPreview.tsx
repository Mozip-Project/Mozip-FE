'use client'

import LinkIcon from '@/assets/icons/link.svg'
import PlusIcon from '@/assets/icons/plus.svg'
import { FileUpload } from '@/components/ui/FileUpload/fileUpload'
import type { FileRule } from '@/utils/file'

type FileAnswerPreviewProps = FileRule & {
  fileDescription: string
  guide?: string
  hasFileUpload?: boolean
  hasLinkInput?: boolean
}

function ignoreFileEvent() {}

function FileAnswerPreview({
  acceptedTypes,
  maxSizeBytes,
  fileDescription,
  guide,
  hasFileUpload = true,
  hasLinkInput = true,
}: FileAnswerPreviewProps) {
  return (
    <>
      {hasFileUpload && (
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
      )}
      {hasLinkInput && (
        <div className="flex flex-col items-start gap-gap-m">
          <div className="flex h-12 w-full items-center gap-gap-s rounded-m border border-neutral-muted bg-layer-default px-padding-m">
            <LinkIcon aria-hidden className="size-5 shrink-0 text-neutral-subtle" />
            <span className="truncate text-body2 font-normal text-placeholder">
              https:// (노션 · 깃허브 등)
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-label1 font-semibold text-neutral">
            <PlusIcon aria-hidden className="size-4 shrink-0" />
            링크 추가
          </span>
        </div>
      )}
    </>
  )
}

export { FileAnswerPreview }
export type { FileAnswerPreviewProps }
