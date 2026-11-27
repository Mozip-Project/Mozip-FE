import type { ReactNode } from 'react'

type PreviewStageProps = {
  children: ReactNode
}

// 팝업 높이 안에서 지원자 화면만 스크롤, 키보드로도 스크롤하도록 focus 가능
function PreviewStage({ children }: PreviewStageProps) {
  return (
    <div
      role="region"
      aria-label="지원자 화면 미리보기"
      tabIndex={0}
      className="min-h-0 flex-1 [scrollbar-width:none] overflow-y-auto rounded-l bg-neutral-weak px-padding-l pt-padding-l outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex min-h-full flex-col gap-gap-xl rounded-t-m border border-b-0 border-neutral-muted bg-layer-default px-padding-xl py-8">
        {children}
      </div>
    </div>
  )
}

export { PreviewStage }
