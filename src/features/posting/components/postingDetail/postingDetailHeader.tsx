import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import type { PostingApplication } from '@/features/posting/types'
import type { PostingRecruitmentPhase } from '@/features/posting/utils/postingDetail'
import { PostingApplyButton } from './postingApplyButton'
import { RecruitmentStatusBadge } from './recruitmentStatusBadge'

const HEADER_APPLY_CTA_ID = 'posting-header-apply-cta'

type PostingDetailHeaderProps = {
  title: string
  application: PostingApplication
  phase: PostingRecruitmentPhase
}

function PostingDetailHeader({ title, application, phase }: PostingDetailHeaderProps) {
  return (
    <div className="flex flex-col gap-gap-l">
      {/* Figma 공고 상세는 뒤로가기와 제목 사이 8px */}
      <PageHeader
        className="gap-gap-s"
        backLink={{ href: '/postings', label: '전체 공고' }}
        title={title}
        actions={
          <div className="flex items-center gap-gap-m">
            <RecruitmentStatusBadge phase={phase} />
            <div id={HEADER_APPLY_CTA_ID}>
              <PostingApplyButton application={application} phase={phase} />
            </div>
          </div>
        }
      />
    </div>
  )
}

export { HEADER_APPLY_CTA_ID, PostingDetailHeader }
