'use client'

import CloseIcon from '@/assets/icons/close.svg'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs/tabs'
import type { ReactNode } from 'react'

const PREVIEW_PANEL_CLASS = 'flex min-h-0 flex-1 flex-col gap-gap-l'

type PostingPreviewDialogProps = {
  trigger: ReactNode
  // 팝업을 열 때만 그려져 조회·변환도 그때 시작
  children: ReactNode
}

function PostingPreviewDialog({ trigger, children }: PostingPreviewDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      {/* 팝업은 화면 높이 안에 고정, 지원자 화면만 안에서 스크롤 */}
      <DialogContent
        overlayClassName="overflow-hidden py-15"
        className="h-195 max-h-[calc(100dvh-var(--spacing)*30)] w-220 items-stretch gap-gap-l"
        aria-describedby={undefined}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

type PostingPreviewTabsProps = {
  detailPanel: ReactNode
  applicationPanel: ReactNode
}

function PostingPreviewTabs({ detailPanel, applicationPanel }: PostingPreviewTabsProps) {
  return (
    <Tabs defaultValue="posting" className={PREVIEW_PANEL_CLASS}>
      <div className="flex shrink-0 flex-col gap-gap-s">
        <div className="flex items-center justify-between gap-gap-m">
          <DialogTitle className="min-w-0 text-heading2 font-bold text-neutral">
            공고 미리보기
          </DialogTitle>
          <DialogClose
            aria-label="닫기"
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-s text-neutral outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
          >
            <CloseIcon aria-hidden className="size-6" />
          </DialogClose>
        </div>
        <TabsList aria-label="미리보기 화면" className="border-b border-neutral-weak">
          <TabsTrigger value="posting">공고 상세</TabsTrigger>
          <TabsTrigger value="application">지원서</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="posting" className={PREVIEW_PANEL_CLASS}>
        {detailPanel}
      </TabsContent>
      <TabsContent value="application" className={PREVIEW_PANEL_CLASS}>
        {applicationPanel}
      </TabsContent>
    </Tabs>
  )
}

export { PostingPreviewDialog, PostingPreviewTabs }
