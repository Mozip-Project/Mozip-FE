'use client'

import { createContext, use, type ComponentProps, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button/button'
import { ListToolBar } from '@/components/ui/ListToolBar/listToolBar'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { Pagination } from '@/components/ui/Pagination/pagination'
import { SearchField } from '@/components/ui/SearchField/searchField'
import { MultiSelectMenu } from '@/components/ui/SelectMenu/multiSelectMenu'
import { SelectMenu } from '@/components/ui/SelectMenu/selectMenu'
import {
  useRecruitmentBoard,
  type RecruitmentBoardQueryChange,
} from '@/features/recruitment/hooks/useRecruitmentBoard'
import type { RecruitmentBoardQuery } from '@/features/recruitment/types'
import { cn } from '@/lib/utils'
import type { Route } from 'next'

type BoardActions = {
  clearKeyword: () => void
  resetFilters: () => void
  canResetFilters: boolean
}

// 표 안 빈 상태 버튼에서도 툴바 조건을 바꾸도록 전달
const BoardActionsContext = createContext<BoardActions | null>(null)

type RecruitmentBoardTab<TStatus extends string> = {
  value: TStatus
  label: string
  // null은 첫 진입 로딩 중
  count: number | null
}

type RecruitmentBoardHeader = Pick<
  ComponentProps<typeof PageHeader>,
  'title' | 'description' | 'actions'
>

type RecruitmentBoardPositionOption<TPosition extends string> = {
  value: TPosition
  label: string
  count?: number
}

type RecruitmentBoardProps<
  TStatus extends string,
  TSort extends string,
  TPosition extends string,
> = {
  header: RecruitmentBoardHeader
  isHeaderSticky?: boolean
  query: RecruitmentBoardQuery<TStatus, TSort, TPosition>
  statusTabs: readonly RecruitmentBoardTab<TStatus>[]
  tabsLabel: string
  sortOptions: readonly { value: TSort; label: string }[]
  sortMenuSideOffset?: number
  positionOptions?: readonly RecruitmentBoardPositionOption<TPosition>[]
  canFilterPosition?: boolean
  isPending: boolean
  skeleton: ReactNode
  currentPage: number
  totalPages: number
  shouldShowSinglePage?: boolean
  shouldHidePaginationWhilePending?: boolean
  getPageHref: (page: number) => Route
  // 페이지 초기화는 호출자 담당
  onQueryChange: (change: RecruitmentBoardQueryChange<TStatus, TSort, TPosition>) => void
  onPageNavigate: (href: Route) => void
  children: ReactNode
  // Suspense fallback에서 조작 차단
  isPlaceholder?: boolean
}

function RecruitmentBoard<TStatus extends string, TSort extends string, TPosition extends string>({
  header,
  isHeaderSticky = false,
  query,
  statusTabs,
  tabsLabel,
  sortOptions,
  sortMenuSideOffset,
  positionOptions = [],
  canFilterPosition = true,
  isPending,
  skeleton,
  currentPage,
  totalPages,
  shouldShowSinglePage,
  shouldHidePaginationWhilePending = false,
  getPageHref,
  onQueryChange,
  onPageNavigate,
  children,
  isPlaceholder = false,
}: RecruitmentBoardProps<TStatus, TSort, TPosition>) {
  const {
    sectionRef,
    searchFieldRef,
    positionMenuRef,
    search,
    selectedPositions,
    positionTotalCount,
    applyQueryChange,
    handlePageNavigate,
    actions,
  } = useRecruitmentBoard({
    query,
    // 첫 탭이 전체 탭
    defaultStatus: statusTabs[0]?.value,
    positionOptions,
    onQueryChange,
    onPageNavigate,
  })

  const pageHeader = (
    <PageHeader
      title={header.title}
      description={header.description}
      className="min-h-10"
      actions={
        <>
          <div ref={searchFieldRef} inert={isPlaceholder} className="contents">
            <SearchField
              size="s"
              className="w-55"
              aria-label="지원자 이름 검색"
              placeholder="이름 검색"
              value={search.keyword}
              onValueChange={search.changeKeyword}
            />
          </div>
          {header.actions}
        </>
      }
    />
  )

  return (
    <>
      {!isHeaderSticky && pageHeader}
      {/* 헤더 고정 모드는 제목이 이 안에 들어가 영역 이름 생략, 표 자체 이름(지원자 목록)으로 구분 */}
      <section ref={sectionRef} aria-label={isHeaderSticky ? undefined : '지원자 목록'}>
        <ListToolBar
          header={isHeaderSticky && pageHeader}
          hasBottomGap={isHeaderSticky}
          isInert={isPlaceholder}
          tabs={statusTabs}
          tabsLabel={tabsLabel}
          value={query.status}
          onValueChange={(status) => applyQueryChange({ status })}
          controls={
            <>
              {canFilterPosition && (
                <div ref={positionMenuRef} className="contents">
                  <MultiSelectMenu
                    label="포지션"
                    options={positionOptions}
                    values={selectedPositions}
                    onValuesChange={(positions) => applyQueryChange({ positions })}
                    totalCount={positionTotalCount}
                    minSelectionMessage="포지션을 1개 이상 선택해 주세요"
                  />
                </div>
              )}
              <SelectMenu
                label="정렬"
                options={sortOptions}
                value={query.sort}
                onValueChange={(sort) => applyQueryChange({ sort })}
                sideOffset={sortMenuSideOffset}
              />
            </>
          }
        >
          <BoardActionsContext value={actions}>
            {/* 300ms까지 이전 목록 유지 후 스켈레톤으로 교체, grid-cols-1로 표 최소 폭의 칸 확장 방지 */}
            <div className="grid grid-cols-1 pt-gap-xl">
              <div className={cn('[grid-area:1/1]', isPending && 'animate-skeleton-delayed-hide')}>
                {children}
              </div>
              {isPending && (
                <div className="animate-skeleton-delayed-show [grid-area:1/1]">{skeleton}</div>
              )}
            </div>
          </BoardActionsContext>
        </ListToolBar>
      </section>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        getPageHref={getPageHref}
        onPageNavigate={handlePageNavigate}
        shouldShowSinglePage={shouldShowSinglePage}
        // 스켈레톤과 같은 300ms 뒤 숨겨 짧은 로딩의 깜빡임 방지
        className={
          isPending && shouldHidePaginationWhilePending
            ? 'animate-skeleton-delayed-hide'
            : undefined
        }
      />
    </>
  )
}

function RecruitmentBoardSearchClearButton({ children }: { children: string }) {
  const actions = use(BoardActionsContext)

  if (!actions) {
    return null
  }

  return (
    <Button variant="secondary" size="m" onClick={actions.clearKeyword}>
      {children}
    </Button>
  )
}

// 전체 탭·전체 포지션이면 되돌릴 조건이 없어 숨김
function RecruitmentBoardFilterResetButton() {
  const actions = use(BoardActionsContext)

  if (!actions?.canResetFilters) {
    return null
  }

  return (
    <Button variant="secondary" size="m" onClick={actions.resetFilters}>
      필터 초기화
    </Button>
  )
}

export { RecruitmentBoard, RecruitmentBoardFilterResetButton, RecruitmentBoardSearchClearButton }
export type { RecruitmentBoardPositionOption, RecruitmentBoardQueryChange, RecruitmentBoardTab }
