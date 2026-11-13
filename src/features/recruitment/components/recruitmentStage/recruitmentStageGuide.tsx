import Link from 'next/link'
import { Button } from '@/components/ui/Button/button'
import { SummaryBar } from '@/components/ui/SummaryBar/summaryBar'
import type { RecruitmentProgress, RecruitmentStage } from '@/features/recruitment/types'
import { getDocumentReviewPath } from '@/features/recruitment/utils/recruitmentRoutes'
import { getRecruitmentStageGuideMessage } from '@/features/recruitment/utils/recruitmentStageGuide'
import type { Route } from 'next'

const STAGE_ACTION_LABEL = {
  posting: '공고 이어서 작성하기',
  application: '지원자 확인하기',
  documentReview: '서류 평가 이어하기',
  documentResult: '서류 결과 안내하기',
  finalResult: '최종 결과 안내하기',
} satisfies Record<RecruitmentStage, string>

// TODO: 공고 작성·지원자 관리·서류 결과 안내 경로가 생기면 연결, 최종 결과는 MVP 이동 없음
function getStageActionHref(stage: RecruitmentStage, recruitmentId: string): Route | undefined {
  return stage === 'documentReview' ? getDocumentReviewPath(recruitmentId) : undefined
}

type RecruitmentStageGuideProps = {
  recruitmentId: string
  // 카드마다 반복되는 버튼 이름 구분용
  title: string
  progress: RecruitmentProgress
}

function RecruitmentStageGuide({ recruitmentId, title, progress }: RecruitmentStageGuideProps) {
  const { stage } = progress
  const actionLabel = STAGE_ACTION_LABEL[stage]
  const actionHref = getStageActionHref(stage, recruitmentId)
  const accessibleActionLabel = `${title} ${actionLabel}`

  return (
    <SummaryBar
      status="ready"
      shouldAnnounce={false}
      className="border-0 bg-neutral-weak shadow-none"
      actions={
        actionHref ? (
          <Button asChild variant="secondary" size="m">
            <Link href={actionHref} aria-label={accessibleActionLabel}>
              {actionLabel}
            </Link>
          </Button>
        ) : (
          <Button variant="secondary" size="m" aria-label={accessibleActionLabel}>
            {actionLabel}
          </Button>
        )
      }
    >
      {getRecruitmentStageGuideMessage(progress)}
    </SummaryBar>
  )
}

export { RecruitmentStageGuide }
