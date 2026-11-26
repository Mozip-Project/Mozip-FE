'use client'

import InfoIcon from '@/assets/icons/info.svg'
import { ImageUploadField } from '@/components/ui/ImageUploadField/imageUploadField'
import { InfoPopover } from '@/components/ui/InfoPopover/infoPopover'
import type { ImageFileRule } from '@/hooks/useImageFilePicker'

// 백엔드 ORG_LOGO 기준, 로고만 webp·svg까지 허용하고 5MB 제한
// TODO: Figma는 10MB 안내라 5MB 문구 디자인 확인 필요
const LOGO_FILE_RULE = {
  acceptedTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
  invalidTypeMessage: '.png, .jpg, .webp, .svg 이미지만 업로드 가능해요',
  maxSizeBytes: 5 * 1024 * 1024,
  oversizedMessage: '5MB 이하의 이미지만 업로드 가능해요',
} satisfies ImageFileRule

type LogoFieldProps = {
  value: File | null
  onChange: (file: File | null) => void
  savedLogoUrl: string | null
}

function LogoField({ value, onChange, savedLogoUrl }: LogoFieldProps) {
  return (
    <ImageUploadField
      value={value}
      onChange={onChange}
      savedImageUrl={savedLogoUrl}
      fileRule={LOGO_FILE_RULE}
      label="로고"
      title={
        <div className="flex items-center gap-gap-xs text-label1 font-semibold">
          <p className="text-neutral">로고</p>
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
                <li>최적 사이즈는 240 × 240 px이며, 5MB 이하의 이미지만 업로드 가능합니다.</li>
                <li>.png, .jpg, .webp, .svg 형식의 이미지를 업로드해 주세요.</li>
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
      }
    />
  )
}

export { LogoField }
