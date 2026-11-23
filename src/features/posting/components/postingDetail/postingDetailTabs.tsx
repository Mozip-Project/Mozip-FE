import { StickyTopBar } from '@/components/ui/StickyTopBar/stickyTopBar'
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs/tabs'
import { ORGANIZATION_TYPE_LABEL } from '@/features/organization/utils/organizationProfile'
import type { PostingDetail } from '@/features/posting/types'
import { OrganizationIntroPanel } from './organizationIntroPanel'
import { PostingDetailTabsRoot } from './postingDetailTabsRoot'
import { PostingNoticePanel } from './postingNoticePanel'
import { PostingQuestionPanel } from './postingQuestionPanel'
import type { ReactNode } from 'react'

type PostingDetailTabsProps = {
  detail: PostingDetail
  // 진행 중인 다른 모집의 D-day 계산 기준
  now: Date
  footer?: ReactNode
}

// 탭을 겹쳐 전환 시 높이 유지, 숨긴 탭은 한 화면 높이까지만 반영
const PANEL_CLASS_NAME =
  'col-start-1 row-start-1 flex flex-col gap-gap-xl data-[state=inactive]:invisible data-[state=inactive]:sticky-content-max-height data-[state=inactive]:overflow-hidden'

function PostingDetailTabs({ detail, now, footer }: PostingDetailTabsProps) {
  const organizationTypeLabel = ORGANIZATION_TYPE_LABEL[detail.organization.type]

  return (
    <PostingDetailTabsRoot defaultValue="notice">
      <StickyTopBar className="before:pointer-events-none before:absolute before:inset-x-0 before:top-full before:h-gap-xl before:bg-linear-to-b before:from-(--background-color-layer-default) before:to-transparent">
        <TabsList aria-label="공고 내용" className="border-b border-neutral-subtle">
          <TabsTrigger value="notice">모집 안내</TabsTrigger>
          <TabsTrigger value="organization">{organizationTypeLabel} 소개</TabsTrigger>
          <TabsTrigger value="questions">지원 문항 미리보기</TabsTrigger>
        </TabsList>
      </StickyTopBar>

      <div className="grid">
        <TabsContent value="notice" forceMount className={PANEL_CLASS_NAME}>
          <PostingNoticePanel
            title={detail.title}
            coverImageUrl={detail.coverImageUrl}
            content={detail.content}
          />
          {footer}
        </TabsContent>

        <TabsContent value="organization" forceMount className={PANEL_CLASS_NAME}>
          <OrganizationIntroPanel organization={detail.organization} now={now} />
          {footer}
        </TabsContent>

        <TabsContent value="questions" forceMount className={PANEL_CLASS_NAME}>
          <PostingQuestionPanel positions={detail.positions} questions={detail.questions} />
          {footer}
        </TabsContent>
      </div>
    </PostingDetailTabsRoot>
  )
}

export { PostingDetailTabs }
