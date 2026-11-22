import { PageHeader } from '@/components/ui/PageHeader/pageHeader'

// 로고·단체명·한 줄 소개·활동 분야·키워드·링크 순서의 입력 자리
const SKELETON_FIELD_KEYS = ['logo', 'name', 'introduction', 'categories', 'keywords', 'links']

// TODO: 로딩 화면 디자인 확인 필요
function OrganizationProfileSkeleton() {
  return (
    <div className="flex flex-col gap-gap-xl">
      <PageHeader title="단체 프로필" />
      <div
        aria-busy
        aria-label="단체 프로필 불러오는 중"
        role="status"
        className="flex flex-col gap-gap-xl bg-layer-default p-padding-xl"
      >
        {SKELETON_FIELD_KEYS.map((key) => (
          <div
            key={key}
            aria-hidden
            className="flex animate-skeleton-delayed-show flex-col gap-gap-xs"
          >
            <span className="skeleton-bar h-3.5 w-20 rounded-full" />
            <span className="skeleton-bar h-12 w-full rounded-s" />
          </div>
        ))}
      </div>
    </div>
  )
}

export { OrganizationProfileSkeleton }
