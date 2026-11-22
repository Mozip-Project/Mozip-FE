import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import type { ComponentProps } from 'react'

// 프로필 이미지·이름·휴대폰 번호·비밀번호 순서의 섹션 자리
const SKELETON_SECTION_KEYS = ['profileImage', 'name', 'phone', 'password']

type AccountEditSkeletonProps = {
  backLink: ComponentProps<typeof PageHeader>['backLink']
}

// TODO: 로딩 화면 디자인 확인 필요
function AccountEditSkeleton({ backLink }: AccountEditSkeletonProps) {
  return (
    <div className="flex flex-col gap-gap-l">
      <PageHeader title="정보 수정" backLink={backLink} />
      <div
        aria-busy
        aria-label="계정 정보 불러오는 중"
        role="status"
        className="flex flex-col gap-gap-xxl"
      >
        {SKELETON_SECTION_KEYS.map((key) => (
          <div
            key={key}
            aria-hidden
            className="flex animate-skeleton-delayed-show flex-col gap-gap-l"
          >
            <span className="skeleton-bar h-6 w-24 rounded-full" />
            <span className="skeleton-bar h-12 w-full rounded-m" />
          </div>
        ))}
      </div>
    </div>
  )
}

export { AccountEditSkeleton }
