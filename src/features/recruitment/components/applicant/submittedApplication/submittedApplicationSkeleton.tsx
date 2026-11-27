import { BackLink } from '@/components/ui/BackLink/backLink'

const SKELETON_CARD_KEYS = ['first', 'second', 'third']

// TODO: 로딩 화면 디자인 확인 필요, 지금은 제목과 카드 윤곽만
function SubmittedApplicationSkeleton() {
  return (
    <div className="mx-auto flex max-w-195 flex-col gap-gap-xl">
      <BackLink href="/applications" label="내 지원" className="self-start" />
      <h1 className="sr-only">제출한 지원서</h1>
      <div role="status">
        <span className="sr-only">지원서를 불러오는 중</span>
        <div aria-hidden className="flex animate-skeleton-delayed-show flex-col gap-gap-l">
          <span className="skeleton-bar h-8 w-2/3 rounded-full" />
          {SKELETON_CARD_KEYS.map((key) => (
            <div
              key={key}
              className="flex flex-col gap-gap-l rounded-l border border-neutral-muted bg-layer-default p-padding-xl"
            >
              <span className="skeleton-bar h-6 w-3/4 rounded-full" />
              <span className="skeleton-bar h-32 w-full rounded-m" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export { SubmittedApplicationSkeleton }
