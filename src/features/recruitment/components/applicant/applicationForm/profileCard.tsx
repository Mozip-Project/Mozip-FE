'use client'

import Image from 'next/image'
import Link from 'next/link'
import CameraIcon from '@/assets/icons/camera.svg'
import ChevronRightIcon from '@/assets/icons/chevronRight.svg'
import { Button } from '@/components/ui/Button/button'
import { InlineNotice } from '@/components/ui/InlineNotice/inlineNotice'
import { useImageFilePicker } from '@/hooks/useImageFilePicker'
import { useObjectUrl } from '@/hooks/useObjectUrl'
import type { ReactNode } from 'react'

const PHOTO_SIZE_PX = 72

type ProfileCardProps = {
  name: string
  // 저장된 프로필 사진, 새로 고른 사진(photo)이 있으면 그쪽을 표시
  savedPhotoUrl: string | null
  photo: File | null
  onPhotoChange: (file: File) => void
  maskedPhone: string
  university: string
  email: string
  isPhotoRequired?: boolean
  // 학과·학년 입력 줄
  children: ReactNode
}

function ProfileCard({
  name,
  savedPhotoUrl,
  photo,
  onPhotoChange,
  maskedPhone,
  university,
  email,
  isPhotoRequired = false,
  children,
}: ProfileCardProps) {
  const photoPicker = useImageFilePicker(onPhotoChange)
  const previewUrl = useObjectUrl(photo)
  const photoSrc = previewUrl ?? savedPhotoUrl
  const isPhotoMissing = isPhotoRequired && !photoSrc

  return (
    <div className="flex flex-col gap-gap-xl rounded-xl border border-neutral-subtle bg-layer-default p-padding-xl">
      <div className="flex flex-col gap-gap-xs">
        <div className="flex items-center justify-between gap-gap-m">
          <div className="flex min-w-0 items-center gap-gap-l">
            <div className="relative flex shrink-0">
              {photoSrc ? (
                <Image
                  src={photoSrc}
                  alt=""
                  width={PHOTO_SIZE_PX}
                  height={PHOTO_SIZE_PX}
                  unoptimized
                  className="size-18 rounded-full bg-neutral-weak-pressed object-cover"
                />
              ) : (
                <div className="size-18 rounded-full checkerboard" />
              )}
              <span
                aria-hidden
                className="absolute -right-1 bottom-0 flex size-6 items-center justify-center rounded-full border border-neutral-subtle bg-layer-default text-neutral-subtle"
              >
                <CameraIcon className="size-3.5" />
              </span>
            </div>
            <p className="min-w-0 truncate text-headline2 font-semibold text-neutral">{name}</p>
          </div>
          {/* TODO: 업로드 API 생기면 저장 연결*/}
          <Button
            asChild
            variant="secondary"
            size="s"
            className="has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus-ring has-focus-visible:outline-solid"
          >
            <label>
              사진 변경
              <input {...photoPicker.inputProps} className="sr-only" />
            </label>
          </Button>
        </div>
        {photoPicker.errorMessage && (
          <p role="alert" className="text-label1 font-normal text-critical">
            {photoPicker.errorMessage}
          </p>
        )}
        {!photoPicker.errorMessage && isPhotoMissing && (
          <p className="text-label1 font-normal text-critical">
            해당 공고는 사진을 올려야 지원서를 작성할 수 있어요
          </p>
        )}
      </div>
      <hr className="border-neutral-subtle" />
      <dl className="flex flex-col gap-gap-l">
        <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-x-gap-l gap-y-gap-s">
          <dt className="text-label1 font-normal text-neutral-muted">휴대폰 번호</dt>
          <dd className="text-body2 font-medium break-words text-neutral">{maskedPhone}</dd>
          <dd className="col-span-2">
            <InlineNotice
              tone="neutral"
              icon={null}
              title="번호가 바뀌었나요?"
              action={
                // TODO: 지원자 마이페이지 경로 생기면 교체(지금은 운영진 영역에만 있음)
                <Link
                  href="/manage/mypage"
                  className="flex shrink-0 items-center gap-gap-xs rounded-s text-label1 font-semibold whitespace-nowrap text-neutral-muted outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
                >
                  마이페이지로 이동
                  <ChevronRightIcon aria-hidden className="size-4 text-neutral" />
                </Link>
              }
            >
              휴대폰 번호는 마이페이지에서 인증 후 바꿀 수 있어요
            </InlineNotice>
          </dd>
        </div>
        <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-x-gap-l">
          <dt className="text-label1 font-normal text-neutral-muted">인증 학교</dt>
          <dd className="text-body2 font-medium break-words text-neutral">{university}</dd>
        </div>
        <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-x-gap-l">
          <dt className="text-label1 font-normal text-neutral-muted">인증 이메일</dt>
          <dd className="text-body2 font-medium break-words text-neutral">{email}</dd>
        </div>
      </dl>
      <hr className="border-neutral-subtle" />
      {children}
    </div>
  )
}

export { ProfileCard }
export type { ProfileCardProps }
