'use client'

import { useRouter } from 'next/navigation'
import {
  createContext,
  use,
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from 'react'
import { Button } from '@/components/ui/Button/button'
import { ListToolBar } from '@/components/ui/ListToolBar/listToolBar'
import { Pagination } from '@/components/ui/Pagination/pagination'
import { SearchField } from '@/components/ui/SearchField/searchField'
import { MultiSelectMenu } from '@/components/ui/SelectMenu/multiSelectMenu'
import { SelectMenu } from '@/components/ui/SelectMenu/selectMenu'
import {
  DOCUMENT_REVIEW_POSITION_LABEL,
  DOCUMENT_REVIEW_POSITIONS,
  DOCUMENT_REVIEW_SORT_LABEL,
  DOCUMENT_REVIEW_SORTS,
  DOCUMENT_REVIEW_STATUS_LABEL,
  DOCUMENT_REVIEW_STATUSES,
  type DocumentReviewPosition,
  type DocumentReviewQuery,
  type DocumentReviewStatus,
} from '@/features/recruitment/api/organizer'
import { cn } from '@/lib/utils'
import { getDocumentReviewHref, parseDocumentReviewQuery } from './documentReviewQuery'
import { DocumentReviewSkeletonTable } from './documentReviewSkeletonTable'
import type { Route } from 'next'

const SEARCH_DEBOUNCE_MS = 300

// 툴바 지역 상태인 검색어를 표 안 빈 상태 버튼에서도 지우도록 전달
const SearchClearContext = createContext<(() => void) | null>(null)

const SORT_OPTIONS = DOCUMENT_REVIEW_SORTS.map((sort) => ({
  value: sort,
  label: DOCUMENT_REVIEW_SORT_LABEL[sort],
}))

type QueryChange = Partial<Omit<DocumentReviewQuery, 'page'>>

type DocumentReviewBoardProps = {
  recruitmentId: string
  query: DocumentReviewQuery
  // null은 첫 진입 로딩 중
  statusCounts: Record<DocumentReviewStatus, number> | null
  positionCounts: Record<DocumentReviewPosition, number> | null
  currentPage: number
  totalPages: number
  children: ReactNode
}

function DocumentReviewBoard({
  recruitmentId,
  query,
  statusCounts,
  positionCounts,
  currentPage,
  totalPages,
  children,
}: DocumentReviewBoardProps) {
  const router = useRouter()
  const sectionRef = useRef<HTMLElement>(null)
  // 서버 응답 전에도 선택한 탭·필터를 바로 표시
  const [optimisticQuery, setOptimisticQuery] = useOptimistic(query)
  const [isPending, startTransition] = useTransition()
  // 입력 중 글자가 서버 응답을 기다리지 않도록 검색어만 지역 상태로 관리
  const [keyword, setKeyword] = useState(query.keyword)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(searchTimerRef.current), [])

  const statusTabs = DOCUMENT_REVIEW_STATUSES.map((status) => ({
    value: status,
    label: DOCUMENT_REVIEW_STATUS_LABEL[status],
    count: statusCounts ? statusCounts[status] : null,
  }))
  const positionOptions = DOCUMENT_REVIEW_POSITIONS.map((position) => ({
    value: position,
    label: DOCUMENT_REVIEW_POSITION_LABEL[position],
    count: positionCounts?.[position],
  }))
  const positionTotalCount = positionCounts
    ? Object.values(positionCounts).reduce((total, count) => total + count, 0)
    : undefined

  // Figma 공통 규칙: 조건 변경 시 표 상단으로, 툴바가 보이면 검색창 가림 방지로 유지
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

  // 조건 변경과 같은 전환으로 로딩 상태 공유, 이동 기록은 남김
  function handlePageNavigate(href: Route) {
    startTransition(() => {
      router.push(href, { scroll: false })
    })
    scrollToTableTop()
  }

  // 조건이 바뀌면 결과 개수가 달라지므로 첫 페이지로 이동
  function applyQueryChange(change: QueryChange) {
    // 대기 중인 검색은 지금 검색어로 함께 적용되므로 취소
    clearTimeout(searchTimerRef.current)
    const nextQuery = { ...optimisticQuery, keyword, ...change, page: 1 }

    startTransition(() => {
      setOptimisticQuery(nextQuery)
      router.replace(getDocumentReviewHref(recruitmentId, nextQuery), { scroll: false })
    })
    scrollToTableTop()
  }

  // 검색어를 모두 지우면 기다리지 않고 전체 목록으로 복귀
  function handleKeywordChange(nextKeyword: string) {
    setKeyword(nextKeyword)

    if (nextKeyword === '') {
      applyQueryChange({ keyword: nextKeyword })
      return
    }

    clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(
      () => applyQueryChange({ keyword: nextKeyword }),
      SEARCH_DEBOUNCE_MS,
    )
  }

  // 사라지는 빈 상태 버튼 대신 검색창으로 focus 이동
  function clearKeyword() {
    handleKeywordChange('')
    sectionRef.current?.querySelector<HTMLInputElement>('[data-slot=search-field-input]')?.focus()
  }

  return (
    <>
      {/* GNB(64px) 아래로 표 상단 정렬 */}
      <section ref={sectionRef} aria-label="지원자 목록" className="scroll-mt-16">
        <ListToolBar
          tabs={statusTabs}
          tabsLabel="평가 상태"
          value={optimisticQuery.status}
          onValueChange={(status) => applyQueryChange({ status })}
          controls={
            <>
              <MultiSelectMenu
                label="포지션"
                options={positionOptions}
                values={optimisticQuery.positions}
                onValuesChange={(positions) => applyQueryChange({ positions })}
                totalCount={positionTotalCount}
                minSelectionMessage="포지션을 1개 이상 선택해 주세요"
              />
              <SelectMenu
                label="정렬"
                options={SORT_OPTIONS}
                value={optimisticQuery.sort}
                onValueChange={(sort) => applyQueryChange({ sort })}
              />
              <SearchField
                size="s"
                className="w-55"
                aria-label="지원자 이름 검색"
                placeholder="이름 검색"
                value={keyword}
                onValueChange={handleKeywordChange}
              />
            </>
          }
        >
          <SearchClearContext value={clearKeyword}>
            {/* 300ms까지 이전 목록 유지 후 스켈레톤으로 교체, grid-cols-1로 표 최소 폭의 칸 확장 방지 */}
            <div className="grid grid-cols-1 pt-gap-xl">
              <div className={cn('[grid-area:1/1]', isPending && 'animate-skeleton-delayed-hide')}>
                {children}
              </div>
              {isPending && (
                <div className="animate-skeleton-delayed-show [grid-area:1/1]">
                  <DocumentReviewSkeletonTable />
                </div>
              )}
            </div>
          </SearchClearContext>
        </ListToolBar>
      </section>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        getPageHref={(page) => getDocumentReviewHref(recruitmentId, { ...query, page })}
        onPageNavigate={handlePageNavigate}
      />
    </>
  )
}

// 첫 진입 로딩용, URL을 읽기 전 정적 셸이라 기본 조건으로 표시하고 조작 차단
function DocumentReviewBoardPlaceholder({ children }: { children: ReactNode }) {
  return (
    <div inert>
      <DocumentReviewBoard
        recruitmentId=""
        query={parseDocumentReviewQuery({})}
        statusCounts={null}
        positionCounts={null}
        currentPage={1}
        totalPages={0}
      >
        {children}
      </DocumentReviewBoard>
    </div>
  )
}

function DocumentReviewSearchClearButton() {
  const clearKeyword = use(SearchClearContext)

  if (!clearKeyword) {
    return null
  }

  return (
    <Button variant="secondary" size="m" onClick={clearKeyword}>
      검색어 삭제
    </Button>
  )
}

export { DocumentReviewBoard, DocumentReviewBoardPlaceholder, DocumentReviewSearchClearButton }
