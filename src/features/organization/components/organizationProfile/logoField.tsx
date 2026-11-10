'use client'

import Image from 'next/image'
import { useId, useRef, useState, type ChangeEvent } from 'react'
import InfoIcon from '@/assets/icons/info.svg'
import RefreshIcon from '@/assets/icons/refresh.svg'
import UploadIcon from '@/assets/icons/upload.svg'
import logoPlaceholder from '@/assets/images/logoPlaceholder.png'
import { Button } from '@/components/ui/Button/button'
import { InfoPopover } from '@/components/ui/InfoPopover/infoPopover'
import { useObjectUrl } from '@/hooks/useObjectUrl'

const LOGO_SIZE_PX = 72
const LOGO_ACCEPT = 'image/png,image/jpeg'
const LOGO_MAX_SIZE_BYTES = 10 * 1024 * 1024

type LogoFieldProps = {
  value: File | null
  onChange: (file: File | null) => void
}

function LogoField({ value, onChange }: LogoFieldProps) {
  const labelId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadButtonRef = useRef<HTMLButtonElement>(null)
  const previewUrl = useObjectUrl(value)
  const [isOversized, setIsOversized] = useState(false)

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // 같은 파일을 다시 골라도 change가 발생하도록 초기화
    event.target.value = ''

    if (!file) {
      return
    }

    const isFileOversized = file.size > LOGO_MAX_SIZE_BYTES
    setIsOversized(isFileOversized)
    if (!isFileOversized) {
      onChange(file)
    }
  }

  function handleReset() {
    onChange(null)
    // 초기화 버튼이 비활성화되며 잃는 포커스를 업로드 버튼으로 이동
    uploadButtonRef.current?.focus()
  }

  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-col gap-gap-xs">
      <div className="flex items-center gap-gap-l">
        <Image
          src={previewUrl ?? logoPlaceholder}
          alt={previewUrl ? '선택한 로고' : ''}
          width={LOGO_SIZE_PX}
          height={LOGO_SIZE_PX}
          unoptimized={previewUrl !== null}
          className="size-18 shrink-0 rounded-full bg-neutral-weak-pressed object-cover"
        />
        <div className="flex flex-col gap-gap-s">
          <div className="flex items-center gap-gap-xs text-label1 font-semibold">
            <p id={labelId} className="text-neutral">
              로고
            </p>
            <InfoPopover
              trigger={
                <button
                  type="button"
                  aria-label="로고 등록 안내 보기"
                  className="flex size-4 cursor-pointer items-center justify-center rounded-full text-neutral-subtle outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
                >
                  <InfoIcon aria-hidden className="size-4" />
                </button>
              }
              title="로고 등록은 이렇게 해요"
              description={
                <ul className="list-disc pl-5.25">
                  <li>최적 사이즈는 240 × 240 px이며, 10MB 이하의 이미지만 업로드 가능합니다.</li>
                  <li>PNG, JPG 형식의 이미지를 업로드해 주세요.</li>
                </ul>
              }
              side="bottom"
              sideOffset={9}
              alignOffset={1}
              className="w-118"
            />
            <span aria-hidden className="text-critical">
              *
            </span>
          </div>
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
              accept={LOGO_ACCEPT}
              tabIndex={-1}
              aria-hidden
              className="hidden"
              onChange={handleFileChange}
            />
            <Button variant="tertiary" size="s" disabled={value === null} onClick={handleReset}>
              <RefreshIcon aria-hidden className="size-4" />
              초기화
            </Button>
          </div>
        </div>
      </div>
      {isOversized && (
        <p role="alert" className="text-label2 font-normal text-critical">
          10MB 이하의 이미지만 업로드 가능해요
        </p>
      )}
    </div>
  )
}

export { LogoField }
