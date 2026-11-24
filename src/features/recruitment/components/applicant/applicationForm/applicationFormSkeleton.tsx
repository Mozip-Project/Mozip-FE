// 포지션 선택 카드 자리 개수
const POSITION_CARD_COUNT = 3

function ApplicationFormSkeleton() {
  return (
    <div
      aria-busy
      aria-label="지원서 불러오는 중"
      role="status"
      className="mx-auto flex max-w-195 animate-skeleton-delayed-show flex-col gap-gap-xl"
    >
      <span aria-hidden className="skeleton-bar h-5 w-20 rounded-full" />
      <div aria-hidden className="flex items-center justify-between gap-gap-l">
        <span className="skeleton-bar h-8 w-80 rounded-s" />
        <div className="flex gap-gap-m">
          <span className="skeleton-bar h-10 w-22 rounded-s" />
          <span className="skeleton-bar h-10 w-22 rounded-s" />
        </div>
      </div>
      <span aria-hidden className="skeleton-bar h-6 w-60 rounded-full" />
      <div aria-hidden className="flex flex-col gap-gap-xxl pt-padding-l">
        <div className="flex flex-col gap-gap-l">
          <span className="skeleton-bar h-6 w-24 rounded-full" />
          {Array.from({ length: POSITION_CARD_COUNT }, (_, index) => (
            // 고정 개수의 자리 표시라 순서가 바뀌지 않음
            <span key={index} className="skeleton-bar h-14 w-full rounded-m" />
          ))}
        </div>
        <div className="flex flex-col gap-gap-l">
          <span className="skeleton-bar h-6 w-24 rounded-full" />
          <span className="skeleton-bar h-60 w-full rounded-m" />
        </div>
      </div>
    </div>
  )
}

export { ApplicationFormSkeleton }
