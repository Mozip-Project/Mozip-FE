// 프로필·학교 인증·소속 단체 순서의 섹션 자리
const SKELETON_SECTION_KEYS = ['profile', 'schoolVerification', 'organizations']

// TODO: 로딩 화면 디자인 확인 필요
function AccountSettingsSkeleton() {
  return (
    <div
      aria-busy
      aria-label="계정 정보 불러오는 중"
      role="status"
      className="flex flex-col gap-gap-l"
    >
      {SKELETON_SECTION_KEYS.map((key) => (
        <div
          key={key}
          aria-hidden
          className="flex animate-skeleton-delayed-show flex-col gap-gap-l py-padding-m"
        >
          <span className="skeleton-bar h-6 w-24 rounded-full" />
          <span className="skeleton-bar h-18 w-full rounded-s" />
        </div>
      ))}
    </div>
  )
}

export { AccountSettingsSkeleton }
