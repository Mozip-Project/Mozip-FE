'use client'

import { useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import CheckIcon from '@/assets/icons/check.svg'
import CloseIcon from '@/assets/icons/close.svg'
import PlusIcon from '@/assets/icons/plus.svg'
import { Badge } from '@/components/ui/Badge/badge'
import { Button } from '@/components/ui/Button/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs/tabs'
import { OrganizationLoadError } from '@/features/organization/components/organizationLoadError/organizationLoadError'
import { useOrganizationPostingsQuery } from '@/features/posting/api/organizer/queries'
import { PostingStartDialog } from '@/features/posting/components/postingCreate/postingStartDialog'
import { MANAGED_POSTING_TAB_STATUSES } from '@/features/posting/utils/managedPosting'
import { getRecruitmentDday } from '@/features/posting/utils/recruitmentDday'
import { getPostingManageDetailPath } from '@/features/recruitment/utils/recruitmentRoutes'
import type { ManagedPostingFieldsFragment } from '@/gql/graphql'
import { cn } from '@/lib/utils'
import { useToast } from '@/providers/toastProvider'
import { isOneOf } from '@/utils/isOneOf'
import { withDirectionParticle } from '@/utils/text'

// 종료 탭은 기획상 제외
const PICKER_TABS = ['published', 'draft'] as const

type PickerTab = (typeof PICKER_TABS)[number]

const PICKER_TAB_LABEL = {
  published: '진행 중',
  draft: '작성 중',
} satisfies Record<PickerTab, string>

// TODO: 빈 목록 디자인 확인 필요
const PICKER_EMPTY_MESSAGE = {
  published: '진행 중인 모집이 없어요',
  draft: '작성 중인 모집이 없어요',
} satisfies Record<PickerTab, string>

const ROW_CLASS = 'flex w-full items-center gap-gap-m rounded-l px-padding-m py-3.5 text-left'

type RecruitPickerDialogProps = {
  organizationId: string | null
  currentPostingId?: string
  children: ReactNode
}

function RecruitPickerDialog({
  organizationId,
  currentPostingId,
  children,
}: RecruitPickerDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="my-auto w-120 items-stretch gap-5 p-7" aria-describedby={undefined}>
        <div className="flex items-start gap-gap-m">
          <DialogTitle className="min-w-0 flex-1 text-heading2 font-bold text-neutral">
            모집 선택
          </DialogTitle>
          <DialogClose
            aria-label="닫기"
            className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-s text-neutral outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
          >
            <CloseIcon aria-hidden className="size-6" />
          </DialogClose>
        </div>
        <RecruitPickerTabs
          organizationId={organizationId}
          currentPostingId={currentPostingId}
          onClose={() => setIsOpen(false)}
        />
        <PostingStartDialog>
          <Button size="l" className="w-full">
            <PlusIcon aria-hidden />새 공고 만들기
          </Button>
        </PostingStartDialog>
      </DialogContent>
    </Dialog>
  )
}

type RecruitPickerTabsProps = {
  organizationId: string | null
  currentPostingId?: string
  onClose: () => void
}

// 팝업이 열릴 때마다 진행 중 탭부터 표시
function RecruitPickerTabs({ organizationId, currentPostingId, onClose }: RecruitPickerTabsProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [tab, setTab] = useState<PickerTab>('published')
  const queries: Record<PickerTab, ReturnType<typeof useOrganizationPostingsQuery>> = {
    published: useOrganizationPostingsQuery(organizationId, MANAGED_POSTING_TAB_STATUSES.published),
    draft: useOrganizationPostingsQuery(organizationId, MANAGED_POSTING_TAB_STATUSES.draft),
  }

  function handleSelect(posting: ManagedPostingFieldsFragment) {
    onClose()
    if (posting.id === currentPostingId) {
      return
    }
    showToast({ title: `${withDirectionParticle(posting.title)} 전환했어요` })
    router.push(getPostingManageDetailPath(posting.id))
  }

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        if (isOneOf(PICKER_TABS, value)) {
          setTab(value)
        }
      }}
    >
      <TabsList aria-label="모집 상태" className="mb-5">
        {PICKER_TABS.map((value) => (
          <TabsTrigger key={value} value={value} count={queries[value].data?.length ?? null}>
            {PICKER_TAB_LABEL[value]}
          </TabsTrigger>
        ))}
      </TabsList>
      {PICKER_TABS.map((value) => {
        const query = queries[value]

        return (
          <TabsContent key={value} value={value}>
            {query.isError ? (
              <OrganizationLoadError
                message="모집 목록을 불러오지 못했어요"
                onRetry={() => void query.refetch()}
              />
            ) : (
              <RecruitPickerList
                tab={value}
                postings={query.data}
                currentPostingId={currentPostingId}
                onSelect={handleSelect}
              />
            )}
          </TabsContent>
        )
      })}
    </Tabs>
  )
}

type RecruitPickerListProps = {
  tab: PickerTab
  postings: ManagedPostingFieldsFragment[] | undefined
  currentPostingId?: string
  onSelect: (posting: ManagedPostingFieldsFragment) => void
}

function RecruitPickerList({ tab, postings, currentPostingId, onSelect }: RecruitPickerListProps) {
  // TODO: 로딩 디자인 확인 필요
  if (!postings) {
    return null
  }
  if (postings.length === 0) {
    return (
      <p className="py-padding-xl text-center text-body2 text-neutral-subtle">
        {PICKER_EMPTY_MESSAGE[tab]}
      </p>
    )
  }

  const now = new Date()

  return (
    <ul className="flex flex-col gap-1.5">
      {postings.map((posting) => {
        const isCurrent = posting.id === currentPostingId
        const dday = getRecruitmentDday(posting, now)

        // TODO: #130 머지 후 getPostingEditPath로 이동 연결, 그 전에는 404라 선택 막음
        if (tab === 'draft') {
          return (
            <li key={posting.id} className={ROW_CLASS}>
              <span className="min-w-0 flex-1 truncate text-body1 font-bold text-neutral">
                {posting.title}
              </span>
            </li>
          )
        }

        return (
          <li key={posting.id}>
            <button
              type="button"
              aria-current={isCurrent || undefined}
              onClick={() => onSelect(posting)}
              className={cn(
                ROW_CLASS,
                'cursor-pointer outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
                isCurrent ? 'bg-brand-weak' : 'hover:bg-layer-default-pressed',
              )}
            >
              <span className="flex min-w-0 flex-1 flex-col items-start gap-gap-s">
                {dday && (
                  <Badge tone="brand" variant={isCurrent ? 'solid' : 'weak'}>
                    마감 {dday}
                  </Badge>
                )}
                <span className="w-full truncate text-body1 font-bold text-neutral">
                  {posting.title}
                </span>
              </span>
              {isCurrent && <CheckIcon aria-hidden className="size-5 shrink-0 text-neutral" />}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export { RecruitPickerDialog }
