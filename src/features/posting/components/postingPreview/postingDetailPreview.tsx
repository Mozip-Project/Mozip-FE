'use client'

import AlertCircleIcon from '@/assets/icons/alertCircle.svg'
import { BackLink } from '@/components/ui/BackLink/backLink'
import { Badge } from '@/components/ui/Badge/badge'
import { Button } from '@/components/ui/Button/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs/tabs'
import { ORGANIZATION_TYPE_LABEL } from '@/features/organization/utils/organizationProfile'
import { OrganizationIntroPanel } from '@/features/posting/components/postingDetail/organizationIntroPanel'
import { PostingNoticePanel } from '@/features/posting/components/postingDetail/postingNoticePanel'
import { PostingQuestionPanel } from '@/features/posting/components/postingDetail/postingQuestionPanel'
import { PostingSummary } from '@/features/posting/components/postingDetail/postingSummary'
import type { PostingOrganization, PostingRecruitmentPhase } from '@/features/posting/types'
import type { PostingPreviewDetail } from '@/features/posting/utils/postingPreview'
import { getRecruitmentStatusBadgeProps } from '@/features/posting/utils/scheduleBadge'
import { PreviewStage } from './previewStage'

type PostingDetailPreviewProps = {
  detail: PostingPreviewDetail
  coverImageUrl: string | null
  // 방금 고른 파일처럼 허용 호스트가 아닌 주소도 그대로 표시
  isCoverImageUnoptimized?: boolean
  // null은 단체 조회 전
  organization: PostingOrganization | null
  // null은 모집 기간 입력 전, 배지 없이 표시
  phase: PostingRecruitmentPhase | null
  // 진행 중인 다른 모집의 D-day 계산 기준
  now: Date
}

function PostingDetailPreview({
  detail,
  coverImageUrl,
  isCoverImageUnoptimized = false,
  organization,
  phase,
  now,
}: PostingDetailPreviewProps) {
  const canApply = phase === null || phase.status === 'open'
  // 지원자 공고 상세와 같이 마감 공고는 신고하기 줄 없음
  const canReport = phase?.status !== 'closed'

  return (
    <PreviewStage>
      {/* 지원자에게 보이는 모습만 확인, 이동·지원 조작만 차단 */}
      <div className="flex flex-col gap-gap-s">
        <div inert className="flex">
          <BackLink href="/" label="전체 공고" />
        </div>
        <div className="flex items-center gap-gap-xl">
          <div className="flex min-w-0 flex-1 items-center gap-gap-m break-words break-keep">
            <h2 className="min-w-0 text-title3 font-bold text-neutral">{detail.title}</h2>
            {phase && (
              <div className="shrink-0">
                <Badge {...getRecruitmentStatusBadgeProps(phase)} />
              </div>
            )}
          </div>
          <div inert className="flex shrink-0">
            <Button size="m" disabled={!canApply}>
              {phase?.status === 'upcoming' ? '모집 예정' : '지원하기'}
            </Button>
          </div>
        </div>
      </div>

      <PostingSummary detail={detail} />

      <Tabs defaultValue="notice" className="flex flex-col gap-gap-xl">
        <TabsList aria-label="공고 내용" className="border-b border-neutral-subtle">
          <TabsTrigger value="notice">모집 안내</TabsTrigger>
          <TabsTrigger value="organization">
            {organization ? ORGANIZATION_TYPE_LABEL[organization.type] : '단체'} 소개
          </TabsTrigger>
          <TabsTrigger value="questions">지원 문항 미리보기</TabsTrigger>
        </TabsList>

        <TabsContent value="notice">
          <PostingNoticePanel
            title={detail.title}
            coverImageUrl={coverImageUrl}
            content={detail.content}
            isCoverImageUnoptimized={isCoverImageUnoptimized}
          />
        </TabsContent>

        {/* 단체 링크·다른 모집으로 이동 차단 */}
        <TabsContent value="organization" inert>
          {organization && <OrganizationIntroPanel organization={organization} now={now} />}
        </TabsContent>

        <TabsContent value="questions">
          <PostingQuestionPanel positions={detail.positions} questions={detail.questions} />
        </TabsContent>
      </Tabs>

      {canReport && (
        <div
          inert
          className="flex items-center gap-gap-s border-t border-neutral-subtle pt-padding-xl"
        >
          <AlertCircleIcon aria-hidden className="size-4 shrink-0 text-neutral-subtle" />
          <p className="text-label2 font-medium text-neutral-subtle">공고 내용에 문제가 있나요?</p>
          <span className="flex h-8 shrink-0 items-center px-padding-s text-label2 font-bold text-neutral-subtle underline">
            신고하기
          </span>
        </div>
      )}
    </PreviewStage>
  )
}

export { PostingDetailPreview }
