import Link from 'next/link'
import { Button } from '@/components/ui/Button/button'
import { SummaryBar } from '@/components/ui/SummaryBar/summaryBar'
import { ServerPostingUnsupportedButton } from '@/features/posting/components/demoServerPosting/serverPostingUnsupportedButton'
import { isServerPosting } from '@/features/posting/utils/demoServerPosting'
import { getPostingEditPath } from '@/features/posting/utils/postingCreateRoute'
import type { RecruitmentProgress, RecruitmentStage } from '@/features/recruitment/types'
import {
  getApplicantManagementPath,
  getDocumentReviewPath,
  getResultNoticePath,
} from '@/features/recruitment/utils/recruitmentRoutes'
import { getRecruitmentStageGuideMessage } from '@/features/recruitment/utils/recruitmentStageGuide'
import type { Route } from 'next'

const STAGE_ACTION_LABEL = {
  posting: '공고 이어서 작성하기',
  application: '지원자 확인하기',
  documentReview: '서류 평가 이어하기',
  documentResult: '서류 결과 안내하기',
  finalResult: '최종 결과 안내하기',
} satisfies Record<RecruitmentStage, string>

function getStageActionHref(stage: RecruitmentStage, postingId: string): Route {
  switch (stage) {
    case 'posting':
      return getPostingEditPath(postingId)
    case 'application':
      return getApplicantManagementPath(postingId)
    case 'documentReview':
      return getDocumentReviewPath(postingId)
    // 면접 없는 모집은 서류 결과가 곧 최종 결과라 같은 안내 화면
    case 'documentResult':
    case 'finalResult':
      return getResultNoticePath(postingId)
  }
}

type RecruitmentStageGuideProps = {
  postingId: string
  // 카드마다 반복되는 버튼 이름 구분용
  title: string
  progress: RecruitmentProgress
}

function RecruitmentStageGuide({ postingId, title, progress }: RecruitmentStageGuideProps) {
  const { stage } = progress
  const actionLabel = STAGE_ACTION_LABEL[stage]
  const actionHref = getStageActionHref(stage, postingId)
  const accessibleActionLabel = `${title} ${actionLabel}`
  // 시연 모드의 실서버 공고는 이어서 작성하기만 실서버로, 지원자·평가 화면은 안내만 (전시회 후 삭제)
  const isUnsupportedServerAction = isServerPosting(postingId) && stage !== 'posting'

  return (
    <SummaryBar
      status="ready"
      shouldAnnounce={false}
      className="border-0 bg-neutral-weak shadow-none"
      actions={
        isUnsupportedServerAction ? (
          <ServerPostingUnsupportedButton
            variant="secondary"
            size="m"
            aria-label={accessibleActionLabel}
          >
            {actionLabel}
          </ServerPostingUnsupportedButton>
        ) : (
          <Button asChild variant="secondary" size="m">
            <Link href={actionHref} aria-label={accessibleActionLabel}>
              {actionLabel}
            </Link>
          </Button>
        )
      }
    >
      {getRecruitmentStageGuideMessage(progress)}
    </SummaryBar>
  )
}

export { RecruitmentStageGuide }
