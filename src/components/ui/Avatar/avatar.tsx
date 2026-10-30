import UserIcon from '@/assets/icons/user.svg'
import { cn } from '@/lib/utils'

// 40은 Figma 미정의, GNB 프로필 버튼 크기 유지용
type AvatarSize = 28 | 40 | 48 | 72

const SIZE_CLASS = {
  28: 'size-7 [&_svg]:size-4',
  40: 'size-10 [&_svg]:size-6',
  48: 'size-12 [&_svg]:size-6',
  72: 'size-18 [&_svg]:size-6',
} satisfies Record<AvatarSize, string>

type AvatarProps = {
  size?: AvatarSize
  className?: string
}

// 프로필 이미지 상태는 Figma 미정의로 기본 아이콘만 표시
function Avatar({ size = 28, className }: AvatarProps) {
  return (
    <span
      data-slot="avatar"
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-weak text-neutral-subtle',
        SIZE_CLASS[size],
        className,
      )}
    >
      <UserIcon aria-hidden className="shrink-0" />
    </span>
  )
}

export { Avatar }
