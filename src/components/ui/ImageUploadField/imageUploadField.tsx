'use client'

import Image from 'next/image'
import { useId, useRef, type ReactNode } from 'react'
import RefreshIcon from '@/assets/icons/refresh.svg'
import UploadIcon from '@/assets/icons/upload.svg'
import { Button } from '@/components/ui/Button/button'
import { useImageFilePicker } from '@/hooks/useImageFilePicker'
import { useObjectUrl } from '@/hooks/useObjectUrl'

const PREVIEW_SIZE_PX = 72

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
  const previewUrl = useObjectUrl(value)
  const imagePicker = useImageFilePicker(onChange)
  const errorId = useId()
  const hasError = imagePicker.errorMessage !== null

  function handleReset() {
    onChange(null)
    imagePicker.clearError()
    // 초기화 버튼이 사라지며 잃는 포커스를 업로드 input으로 이동
    fileInputRef.current?.focus()
  }

  return (
    <div role="group" aria-label={label} className="flex flex-col gap-gap-xs">
      <div className="flex items-center gap-gap-l">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt={`선택한 ${label}`}
            width={PREVIEW_SIZE_PX}
            height={PREVIEW_SIZE_PX}
            unoptimized
            className="size-18 shrink-0 rounded-full bg-neutral-weak-pressed object-cover"
          />
        ) : (
          // 이미지 선택 전 빈 미리보기
          <div aria-hidden className="size-18 shrink-0 rounded-full checkerboard" />
        )}
        <div className="flex flex-col gap-gap-s">
          {title}
          <div className="flex gap-gap-s">
            <Button
              asChild
              variant="secondary"
              size="s"
              className="has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus-ring has-focus-visible:outline-solid"
            >
              <label>
                <UploadIcon aria-hidden className="size-4" />
                이미지 업로드
                <input
                  ref={fileInputRef}
                  {...imagePicker.inputProps}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? errorId : undefined}
                  className="sr-only"
                />
              </label>
            </Button>
            {value && (
              <Button variant="tertiary" size="s" onClick={handleReset}>
                <RefreshIcon aria-hidden className="size-4" />
                초기화
              </Button>
            )}
          </div>
        </div>
      </div>
      {hasError && (
        <p id={errorId} role="alert" className="text-label2 font-normal text-critical">
          {imagePicker.errorMessage}
        </p>
      )}
    </div>
  )
}

export { ImageUploadField }
