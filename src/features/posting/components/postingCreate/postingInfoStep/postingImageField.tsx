'use client'

import { useId, useRef } from 'react'
import { flushSync } from 'react-dom'
import InfoIcon from '@/assets/icons/info.svg'
import { FieldLabel } from '@/components/ui/FieldLabel/fieldLabel'
import { InfoPopover } from '@/components/ui/InfoPopover/infoPopover'
import { useObjectUrl } from '@/hooks/useObjectUrl'
import { ImageThumbnail } from './imageThumbnail'
import { PostingImageCameraDialog } from './postingImageCameraDialog'

const INFO_POPOVER_OFFSET_PX = 9
const INFO_POPOVER_ALIGN_OFFSET_PX = 1

// const REJECTION_MESSAGE = {
//  invalidType: 'JPG, PNG, WEBP 이미지만 업로드 가능해요',
// oversized: '10MB 이하의 이미지만 업로드 가능해요',
//} satisfies Record<FileRejection, string>

type PostingImageFieldProps = {
  value: File | null
  // 이어서 작성할 때 서버에 저장된 이미지, 새 파일을 고르면 파일이 우선
  savedImageUrl: string | null
  onChange: (file: File | null) => void
}

function PostingImageField({ value, savedImageUrl, onChange }: PostingImageFieldProps) {
  const labelId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const previewUrl = useObjectUrl(value) ?? savedImageUrl
  //  const { showToast } = useToast()

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
                <p>PNG, JPG, WEBP 형식의 이미지를 업로드해 주세요.</p>
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
        <div data-track-target="posting_image_upload" className="contents">
          {/**
           *  <FileUpload
            inputRef={inputRef}
            acceptedTypes={POSTING_IMAGE_TYPES}
            maxSizeBytes={POSTING_IMAGE_MAX_SIZE_BYTES}
            description="JPG, PNG, WEBP, 장당 10MB 이하"
            onFileSelect={onChange}
            onReject={(rejection) =>
              showToast({ title: REJECTION_MESSAGE[rejection], icon: 'alert' })
            }
          />
           * 
           */}

          <PostingImageCameraDialog onCapture={onChange} />
        </div>
      )}
    </div>
  )
}

export { PostingImageField }
