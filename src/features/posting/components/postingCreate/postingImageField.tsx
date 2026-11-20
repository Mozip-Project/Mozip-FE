'use client'

import { useId, useRef } from 'react'
import { flushSync } from 'react-dom'
import InfoIcon from '@/assets/icons/info.svg'
import { InfoPopover } from '@/components/ui/InfoPopover/infoPopover'
import {
  POSTING_IMAGE_MAX_SIZE_BYTES,
  POSTING_IMAGE_TYPES,
} from '@/features/posting/schemas/postingInfoSchema'
import { useObjectUrl } from '@/hooks/useObjectUrl'
import { useToast } from '@/providers/toastProvider'
import type { FileRejection } from '@/utils/file'
import { FieldLabel } from './fieldLabel'
import { FileUpload } from './fileUpload'
import { ImageThumbnail } from './imageThumbnail'

const INFO_POPOVER_OFFSET_PX = 9
const INFO_POPOVER_ALIGN_OFFSET_PX = 1

const REJECTION_MESSAGE = {
  invalidType: 'JPG, PNG 이미지만 업로드 가능해요',
  oversized: '10MB 이하의 이미지만 업로드 가능해요',
} satisfies Record<FileRejection, string>

type PostingImageFieldProps = {
  value: File | null
  onChange: (file: File | null) => void
}

function PostingImageField({ value, onChange }: PostingImageFieldProps) {
  const labelId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const previewUrl = useObjectUrl(value)
  const { showToast } = useToast()

  function handleRemove() {
    // 썸네일이 사라지며 잃는 포커스를 업로드 입력으로 이동
    flushSync(() => onChange(null))
    inputRef.current?.focus()
  }

  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-col gap-gap-s">
      <FieldLabel
        id={labelId}
        label="대표 이미지"
        required
        info={
          <InfoPopover
            trigger={
              <button
                type="button"
                aria-label="대표 이미지 등록 안내 보기"
                className="flex size-4 cursor-pointer items-center justify-center rounded-full text-neutral-subtle outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
              >
                <InfoIcon aria-hidden className="size-4" />
              </button>
            }
            title="대표 이미지 등록은 이렇게 해요"
            description={
              <>
                <p>최적 사이즈는 1600 × 800 px이며, 10MB 이하의 이미지만 업로드 가능합니다.</p>
                <p>PNG, JPG 형식의 이미지를 업로드해 주세요.</p>
              </>
            }
            side="bottom"
            sideOffset={INFO_POPOVER_OFFSET_PX}
            alignOffset={INFO_POPOVER_ALIGN_OFFSET_PX}
          />
        }
      />
      {previewUrl ? (
        <ImageThumbnail src={previewUrl} alt="대표 이미지" onRemove={handleRemove} />
      ) : (
        <FileUpload
          inputRef={inputRef}
          acceptedTypes={POSTING_IMAGE_TYPES}
          maxSizeBytes={POSTING_IMAGE_MAX_SIZE_BYTES}
          description="JPG, PNG, 장당 10MB 이하"
          onFileSelect={onChange}
          onReject={(rejection) =>
            showToast({ title: REJECTION_MESSAGE[rejection], icon: 'alert' })
          }
        />
      )}
    </div>
  )
}

export { PostingImageField }
