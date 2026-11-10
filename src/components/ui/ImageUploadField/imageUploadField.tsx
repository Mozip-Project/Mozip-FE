'use client'

import Image from 'next/image'
import { useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import RefreshIcon from '@/assets/icons/refresh.svg'
import UploadIcon from '@/assets/icons/upload.svg'
import imagePlaceholder from '@/assets/images/logoPlaceholder.png'
import { Button } from '@/components/ui/Button/button'
import { useObjectUrl } from '@/hooks/useObjectUrl'

const PREVIEW_SIZE_PX = 72
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg']
const IMAGE_MAX_SIZE_BYTES = 10 * 1024 * 1024

type UploadError = 'invalidType' | 'oversized'

const UPLOAD_ERROR_MESSAGES = {
  invalidType: 'PNG, JPG 이미지만 업로드 가능해요',
  oversized: '10MB 이하의 이미지만 업로드 가능해요',
} satisfies Record<UploadError, string>

type ImageUploadFieldProps = {
  value: File | null
  onChange: (file: File | null) => void
  // 묶음의 접근 가능한 이름, 미리보기 alt에도 사용
  label: string
  // 미리보기 옆 제목 줄, 화면마다 제목 스타일·안내 아이콘이 달라 slot으로 받음
  title: ReactNode
}

function ImageUploadField({ value, onChange, label, title }: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadButtonRef = useRef<HTMLButtonElement>(null)
  const previewUrl = useObjectUrl(value)
  const [uploadError, setUploadError] = useState<UploadError | null>(null)

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // 같은 파일을 다시 골라도 change가 발생하도록 초기화
    event.target.value = ''

    if (!file) {
      return
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setUploadError('invalidType')
      return
    }
    if (file.size > IMAGE_MAX_SIZE_BYTES) {
      setUploadError('oversized')
      return
    }

    setUploadError(null)
    onChange(file)
  }

  function handleReset() {
    onChange(null)
    setUploadError(null)
    // 초기화 버튼이 사라지며 잃는 포커스를 업로드 버튼으로 이동
    uploadButtonRef.current?.focus()
  }

  return (
    <div role="group" aria-label={label} className="flex flex-col gap-gap-xs">
      <div className="flex items-center gap-gap-l">
        <Image
          src={previewUrl ?? imagePlaceholder}
          alt={previewUrl ? `선택한 ${label}` : ''}
          width={PREVIEW_SIZE_PX}
          height={PREVIEW_SIZE_PX}
          unoptimized={previewUrl !== null}
          className="size-18 shrink-0 rounded-full bg-neutral-weak-pressed object-cover"
        />
        <div className="flex flex-col gap-gap-s">
          {title}
          <div className="flex gap-gap-s">
            <Button
              ref={uploadButtonRef}
              variant="secondary"
              size="s"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadIcon aria-hidden className="size-4" />
              이미지 업로드
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              tabIndex={-1}
              aria-hidden
              className="hidden"
              onChange={handleFileChange}
            />
            {value && (
              <Button variant="tertiary" size="s" onClick={handleReset}>
                <RefreshIcon aria-hidden className="size-4" />
                초기화
              </Button>
            )}
          </div>
        </div>
      </div>
      {uploadError && (
        <p role="alert" className="text-label2 font-normal text-critical">
          {UPLOAD_ERROR_MESSAGES[uploadError]}
        </p>
      )}
    </div>
  )
}

export { ImageUploadField }
