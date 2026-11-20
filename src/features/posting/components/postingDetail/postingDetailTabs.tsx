import { StickyTopBar } from '@/components/ui/StickyTopBar/stickyTopBar'
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs/tabs'
import { POSTING_ACTIVITY_TYPE_LABEL, type PostingDetail } from '@/features/posting/types'
import { OrganizationIntroPanel } from './organizationIntroPanel'
import { PostingDetailTabsRoot } from './postingDetailTabsRoot'
import { PostingNoticePanel } from './postingNoticePanel'
import { PostingQuestionPanel } from './postingQuestionPanel'

type PostingDetailTabsProps = {
  detail: PostingDetail
  // 진행 중인 다른 모집의 D-day 계산 기준
  now: Date
}

function PostingDetailTabs({ detail, now }: PostingDetailTabsProps) {
  const activityTypeLabel = POSTING_ACTIVITY_TYPE_LABEL[detail.organization.activityType]

  return (
    <PostingDetailTabsRoot defaultValue="notice">
      <StickyTopBar className="before:pointer-events-none before:absolute before:inset-x-0 before:top-full before:h-gap-xl before:bg-linear-to-b before:from-(--background-color-layer-default) before:to-transparent">
        <TabsList aria-label="공고 내용" className="border-b border-neutral-subtle">
          <TabsTrigger value="notice">모집 안내</TabsTrigger>
          <TabsTrigger value="organization">{activityTypeLabel} 소개</TabsTrigger>
          <TabsTrigger value="questions">지원 문항 미리보기</TabsTrigger>
        </TabsList>
      </StickyTopBar>

      <TabsContent value="notice">
        <PostingNoticePanel
          title={detail.title}
          coverImage={detail.coverImage}
          content={detail.content}
        />
      </TabsContent>

      <TabsContent value="organization">
        <OrganizationIntroPanel
          organization={detail.organization}
          currentPostingId={detail.id}
          now={now}
        />
      </TabsContent>

      <TabsContent value="questions">
        <PostingQuestionPanel
          positions={detail.application.type === 'byPosition' ? detail.application.positions : []}
          questions={detail.questions}
        />
      </TabsContent>
    </PostingDetailTabsRoot>
  )
}

export { PostingDetailTabs }
