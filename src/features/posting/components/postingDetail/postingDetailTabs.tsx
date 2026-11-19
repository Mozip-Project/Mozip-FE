import { StickyTopBar } from '@/components/ui/StickyTopBar/stickyTopBar'
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs/tabs'
import { POSTING_ACTIVITY_TYPE_LABEL, type PostingDetail } from '@/features/posting/types'
import { OrganizationIntroPanel } from './organizationIntroPanel'
import { PostingDetailTabsRoot } from './postingDetailTabsRoot'
import { PostingNoticePanel } from './postingNoticePanel'
import { PostingQuestionPanel } from './postingQuestionPanel'

type PostingDetailTabsProps = {
  detail: PostingDetail
}

function PostingDetailTabs({ detail }: PostingDetailTabsProps) {
  const activityTypeLabel = POSTING_ACTIVITY_TYPE_LABEL[detail.organization.activityType]

  return (
    <PostingDetailTabsRoot defaultValue="notice">
      {/* 고정 중 아래 간격도 배경으로 가려 내용이 탭 줄에 붙지 않게, 음수 margin으로 처음 배치 유지 */}
      <StickyTopBar className="-mb-gap-xl pb-gap-xl">
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
        <OrganizationIntroPanel organization={detail.organization} currentPostingId={detail.id} />
      </TabsContent>
      <TabsContent value="questions">
        <PostingQuestionPanel questions={detail.questions} />
      </TabsContent>
    </PostingDetailTabsRoot>
  )
}

export { PostingDetailTabs }
