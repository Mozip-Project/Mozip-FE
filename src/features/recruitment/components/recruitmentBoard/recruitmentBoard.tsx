'use client'

import { createContext, use, useRef, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button/button'
import { ListToolBar } from '@/components/ui/ListToolBar/listToolBar'
import { Pagination } from '@/components/ui/Pagination/pagination'
import { SearchField } from '@/components/ui/SearchField/searchField'
import { MultiSelectMenu } from '@/components/ui/SelectMenu/multiSelectMenu'
import { SelectMenu } from '@/components/ui/SelectMenu/selectMenu'
import {
  DOCUMENT_REVIEW_POSITION_LABEL,
  DOCUMENT_REVIEW_POSITIONS,
  type DocumentReviewPosition,
  type RecruitmentBoardQuery,
} from '@/features/recruitment/types'
import { hasPositionFilter } from '@/features/recruitment/utils/boardQuery'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
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

type RecruitmentBoardQueryChange<TStatus extends string, TSort extends string> = Partial<
  Omit<RecruitmentBoardQuery<TStatus, TSort>, 'page'>
>

type RecruitmentBoardProps<TStatus extends string, TSort extends string> = {
  query: RecruitmentBoardQuery<TStatus, TSort>
  statusTabs: readonly RecruitmentBoardTab<TStatus>[]
  tabsLabel: string
  sortOptions: readonly { value: TSort; label: string }[]
  positionCounts: Record<DocumentReviewPosition, number> | null
  isPending: boolean
  skeleton: ReactNode
  currentPage: number
  totalPages: number
  getPageHref: (page: number) => Route
  // 검색어를 포함한 변경 조건 전달, 페이지 초기화는 호출자 담당
  onQueryChange: (change: RecruitmentBoardQueryChange<TStatus, TSort>) => void
  onPageNavigate: (href: Route) => void
  children: ReactNode
}

function RecruitmentBoard<TStatus extends string, TSort extends string>({
  query,
  statusTabs,
  tabsLabel,
  sortOptions,
  positionCounts,
  isPending,
  skeleton,
  currentPage,
  totalPages,
  getPageHref,
  onQueryChange,
  onPageNavigate,
  children,
}: RecruitmentBoardProps<TStatus, TSort>) {
  const sectionRef = useRef<HTMLElement>(null)
  const positionMenuRef = useRef<HTMLDivElement>(null)
  const search = useDebouncedSearch(query.keyword, (keyword) => applyQueryChange({ keyword }))

  const positionOptions = DOCUMENT_REVIEW_POSITIONS.map((position) => ({
    value: position,
    label: DOCUMENT_REVIEW_POSITION_LABEL[position],
    count: positionCounts?.[position],
  }))
  const isPositionFiltered = hasPositionFilter(query.positions)
  // 첫 탭이 전체 탭
  const defaultStatus = statusTabs[0]?.value
  const isTabFiltered = defaultStatus !== undefined && query.status !== defaultStatus
  const positionTotalCount = positionCounts
    ? Object.values(positionCounts).reduce((total, count) => total + count, 0)
    : undefined

  function scrollToTableTop() {
    const section = sectionRef.current

    if (!section) {
      return
    }

    const stickyOffset = parseFloat(getComputedStyle(section).scrollMarginTop)

    if (section.getBoundingClientRect().top < stickyOffset) {
      section.scrollIntoView({ block: 'start' })
    }
  }

  function handlePageNavigate(href: Route) {
    onPageNavigate(href)
    scrollToTableTop()
  }

  function applyQueryChange(change: RecruitmentBoardQueryChange<TStatus, TSort>) {
    search.cancelPendingSearch()
    onQueryChange({ keyword: search.keyword, ...change })
    scrollToTableTop()
  }

  // 사라지는 빈 상태 버튼 대신 검색창으로 focus 이동
  function clearKeyword() {
    search.changeKeyword('')
    sectionRef.current?.querySelector<HTMLInputElement>('[data-slot=search-field-input]')?.focus()
  }

  // 포지션 필터가 있으면 포지션만 전체로, 없으면 탭을 전체로 되돌리고 바뀐 조건으로 focus 이동
  function resetFilters() {
    if (isPositionFiltered) {
      applyQueryChange({ positions: DOCUMENT_REVIEW_POSITIONS })
      positionMenuRef.current?.querySelector('button')?.focus()
      return
    }

    if (defaultStatus !== undefined) {
      applyQueryChange({ status: defaultStatus })
      sectionRef.current?.querySelector<HTMLElement>('[role=tab]')?.focus()
    }
  }

  return (
    <>
      {/* GNB(64px) 아래로 표 상단 정렬 */}
      <section ref={sectionRef} aria-label="지원자 목록" className="scroll-mt-16">
        <ListToolBar
          tabs={statusTabs}
          tabsLabel={tabsLabel}
          value={query.status}
          onValueChange={(status) => applyQueryChange({ status })}
          controls={
            <>
              <div ref={positionMenuRef} className="contents">
                <MultiSelectMenu
                  label="포지션"
                  options={positionOptions}
                  values={query.positions}
                  onValuesChange={(positions) => applyQueryChange({ positions })}
                  totalCount={positionTotalCount}
                  minSelectionMessage="포지션을 1개 이상 선택해 주세요"
                />
              </div>
              <SelectMenu
                label="정렬"
                options={sortOptions}
                value={query.sort}
                onValueChange={(sort) => applyQueryChange({ sort })}
              />
              <SearchField
                size="s"
                className="w-55"
                aria-label="지원자 이름 검색"
                placeholder="이름 검색"
                value={search.keyword}
                onValueChange={search.changeKeyword}
              />
            </>
          }
        >
          <BoardActionsContext
            value={{
              clearKeyword,
              resetFilters,
              canResetFilters: isPositionFiltered || isTabFiltered,
            }}
          >
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
export type { RecruitmentBoardQueryChange, RecruitmentBoardTab }
