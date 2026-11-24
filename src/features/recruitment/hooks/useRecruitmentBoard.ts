import { useRef } from 'react'
import { scrollToStickyBarTop } from '@/components/ui/StickyTopBar/stickyTopBar'
import type { DocumentReviewPosition, RecruitmentBoardQuery } from '@/features/recruitment/types'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import type { Route } from 'next'

type RecruitmentBoardQueryChange<
  TStatus extends string,
  TSort extends string,
  TPosition extends string = DocumentReviewPosition,
> = Partial<Omit<RecruitmentBoardQuery<TStatus, TSort, TPosition>, 'page'>>

type UseRecruitmentBoardOptions<
  TStatus extends string,
  TSort extends string,
  TPosition extends string,
> = {
  query: RecruitmentBoardQuery<TStatus, TSort, TPosition>
  defaultStatus: TStatus | undefined
  positionOptions: readonly { value: TPosition; count?: number }[]
  onQueryChange: (change: RecruitmentBoardQueryChange<TStatus, TSort, TPosition>) => void
  onPageNavigate: (href: Route) => void
}

function useRecruitmentBoard<
  TStatus extends string,
  TSort extends string,
  TPosition extends string,
>({
  query,
  defaultStatus,
  positionOptions,
  onQueryChange,
  onPageNavigate,
}: UseRecruitmentBoardOptions<TStatus, TSort, TPosition>) {
  const sectionRef = useRef<HTMLElement>(null)
  const searchFieldRef = useRef<HTMLDivElement>(null)
  const positionMenuRef = useRef<HTMLDivElement>(null)
  const search = useDebouncedSearch(query.keyword, (keyword) => applyQueryChange({ keyword }))

  const allPositions = positionOptions.map((option) => option.value)
  // 빈 배열은 전체 포지션 선택
  const selectedPositions = query.positions.length > 0 ? query.positions : allPositions
  const isPositionFiltered = allPositions.some((position) => !selectedPositions.includes(position))
  const isTabFiltered = defaultStatus !== undefined && query.status !== defaultStatus
  const hasPositionCounts =
    positionOptions.length > 0 && positionOptions.every((option) => option.count !== undefined)
  const positionTotalCount = hasPositionCounts
    ? positionOptions.reduce((total, option) => total + (option.count ?? 0), 0)
    : undefined

  function scrollToTableTop() {
    if (sectionRef.current) {
      scrollToStickyBarTop(sectionRef.current)
    }
  }

  function handlePageNavigate(href: Route) {
    search.discardDraft()
    onPageNavigate(href)
    scrollToTableTop()
  }

  function applyQueryChange(change: RecruitmentBoardQueryChange<TStatus, TSort, TPosition>) {
    search.cancelPendingSearch()
    onQueryChange({ keyword: search.keyword, ...change })
    scrollToTableTop()
  }

  // 사라지는 빈 상태 버튼 대신 검색창으로 focus 이동
  function clearKeyword() {
    search.changeKeyword('')
    searchFieldRef.current
      ?.querySelector<HTMLInputElement>('[data-slot=search-field-input]')
      ?.focus({ preventScroll: true })
  }

  // 포지션 필터가 있으면 포지션만 전체로, 없으면 탭을 전체로 되돌리고 바뀐 조건으로 focus 이동
  function resetFilters() {
    if (isPositionFiltered) {
      applyQueryChange({ positions: allPositions })
      positionMenuRef.current?.querySelector('button')?.focus({ preventScroll: true })
      return
    }

    if (defaultStatus !== undefined) {
      applyQueryChange({ status: defaultStatus })
      sectionRef.current?.querySelector<HTMLElement>('[role=tab]')?.focus({ preventScroll: true })
    }
  }

  return {
    sectionRef,
    searchFieldRef,
    positionMenuRef,
    search,
    selectedPositions,
    positionTotalCount,
    applyQueryChange,
    handlePageNavigate,
    actions: {
      clearKeyword,
      resetFilters,
      canResetFilters: isPositionFiltered || isTabFiltered,
    },
  }
}

export { useRecruitmentBoard }
export type { RecruitmentBoardQueryChange }
