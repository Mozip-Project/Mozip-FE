'use client'

import Image from 'next/image'
import { useState } from 'react'
import UserIcon from '@/assets/icons/user.svg'
import { cn } from '@/lib/utils'

// 40: GNB 프로필용, Figma 미정의
type AvatarSize = 28 | 32 | 40 | 48 | 72

const SIZE_CLASS = {
  28: 'size-7 [&_svg]:size-4',
  32: 'size-8 [&_svg]:size-5',
  40: 'size-10 [&_svg]:size-6',
  48: 'size-12 [&_svg]:size-6',
  72: 'size-18 [&_svg]:size-6',
} satisfies Record<AvatarSize, string>

type AvatarProps = {
  size?: AvatarSize
  // 없거나 불러오지 못하면 사람 아이콘, 옆에 이름이 같이 보이는 자리라 장식 이미지로 처리
  src?: string | null
  className?: string
}

// 프로필 이미지 상태는 Figma 미정의
function Avatar({ size = 28, src, className }: AvatarProps) {
  // 주소가 바뀌면 다시 시도하도록 실패한 주소를 기억
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const imageSrc = src && src !== failedSrc ? src : null

  return (
    <span
      data-slot="avatar"
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-weak text-neutral-subtle',
        SIZE_CLASS[size],
        className,
      )}
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes={`${size}px`}
          className="object-cover"
          onError={() => setFailedSrc(imageSrc)}
        />
      ) : (
        <UserIcon aria-hidden className="shrink-0" />
      )}
    </span>
  )
}

export { Avatar }
