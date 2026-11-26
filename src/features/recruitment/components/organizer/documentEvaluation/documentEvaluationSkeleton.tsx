import { StickyTopBar } from '@/components/ui/StickyTopBar/stickyTopBar'
import { EvaluationPanelHeader } from '@/features/recruitment/components/organizer/documentEvaluationPanel/evaluationPanelHeader'
import type { ReactNode } from 'react'

// 칩 줄 아래 고정(--sticky-offset: 칩 줄 높이 + 간격), 길면 입력 영역만 패널 안 스크롤
const EVALUATION_PANEL_CLASS =
  'sticky-below-gnb flex max-h-[calc(100dvh-var(--sticky-top)-var(--sticky-offset)-var(--page-padding-bottom))] w-100 shrink-0 flex-col rounded-l border border-neutral-muted bg-layer-default [--sticky-offset:calc(var(--sticky-top-bar-height)+var(--spacing-gap-xl))]'

const CARD_CLASS =
  'flex flex-col gap-gap-l rounded-l border border-neutral-muted bg-layer-default p-padding-xl'

// 화면 폭보다 많이 두고 넘치는 칩은 잘라 보이게
const SKELETON_CHIP_KEYS = ['1', '2', '3', '4', '5', '6']
const SKELETON_QUESTION_KEYS = ['first', 'second']
const SKELETON_SCORE_KEYS = ['first', 'second']

type SkeletonProps = {
  label: string
  className?: string
  children: ReactNode
}

// 짧은 로딩엔 안 보이도록 늦게 표시, 스크린리더엔 불러오는 중만 알림
function Skeleton({ label, className, children }: SkeletonProps) {
  return (
    <div role="status" className={className}>
      <span className="sr-only">{label}</span>
      <div aria-hidden className="flex animate-skeleton-delayed-show flex-col gap-gap-l">
        {children}
      </div>
    </div>
  )
}

// TODO: 로딩 화면 디자인 확인 필요, 지금은 카드·칸 모양만 대강 잡음
function DocumentEvaluationChipStripSkeleton() {
  return (
    <StickyTopBar className="-mb-gap-xl pb-gap-xl">
      <Skeleton label="지원자 목록을 불러오는 중" className="w-full max-w-page min-w-70">
        <div className="flex gap-gap-s overflow-hidden">
          {SKELETON_CHIP_KEYS.map((key) => (
            <span key={key} className="skeleton-bar h-12 w-50 shrink-0 rounded-m" />
          ))}
        </div>
      </Skeleton>
    </StickyTopBar>
  )
}

// 지원자 정보 카드와 답변 카드 두 개 자리
function DocumentEvaluationApplicationSkeleton() {
  return (
    <Skeleton label="지원서를 불러오는 중">
      <div className={CARD_CLASS}>
        <div className="flex items-center gap-gap-m">
          <span className="skeleton-bar size-12 rounded-full" />
          <span className="skeleton-bar h-6 w-40 rounded-full" />
        </div>
        <span className="skeleton-bar h-4 w-64 rounded-full" />
      </div>
      {SKELETON_QUESTION_KEYS.map((key) => (
        <div key={key} className={CARD_CLASS}>
          <span className="skeleton-bar h-6 w-3/4 rounded-full" />
          <span className="skeleton-bar h-32 w-full rounded-m" />
        </div>
      ))}
    </Skeleton>
  )
}

// 제목은 그대로 두고 아래 입력 영역만
function DocumentEvaluationPanelSkeleton() {
  return (
    <section className={EVALUATION_PANEL_CLASS}>
      <div className="shrink-0 px-padding-xl pt-padding-xl">
        <EvaluationPanelHeader saveState={{ status: 'idle' }} />
      </div>
      <Skeleton label="내 평가를 불러오는 중" className="p-padding-xl">
        <span className="skeleton-bar h-10 w-full rounded-m" />
        {SKELETON_SCORE_KEYS.map((key) => (
          <span key={key} className="skeleton-bar h-10 w-full rounded-m" />
        ))}
        <span className="skeleton-bar h-24 w-full rounded-m" />
      </Skeleton>
    </section>
  )
}

// 주소의 지원자를 읽기 전 정적 셸
function DocumentEvaluationContentSkeleton() {
  return (
    <div className="flex items-start gap-gap-xl">
      <div className="min-w-0 flex-1">
        <DocumentEvaluationApplicationSkeleton />
      </div>
      <DocumentEvaluationPanelSkeleton />
    </div>
  )
}

export {
  DocumentEvaluationApplicationSkeleton,
  DocumentEvaluationChipStripSkeleton,
  DocumentEvaluationContentSkeleton,
  DocumentEvaluationPanelSkeleton,
  EVALUATION_PANEL_CLASS,
}
