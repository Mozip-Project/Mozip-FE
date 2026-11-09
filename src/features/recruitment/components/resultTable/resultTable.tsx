import ChevronRightIcon from '@/assets/icons/chevronRight.svg'
import { Badge, type BADGE_TONES } from '@/components/ui/Badge/badge'
import { InfoPopover } from '@/components/ui/InfoPopover/infoPopover'
import { SegmentGroup } from '@/components/ui/SegmentGroup/segmentGroup'
import { SegmentOption, type SEGMENT_TONES } from '@/components/ui/SegmentGroup/segmentOption'
import { TableCell, TableHeadAction, TableHeadCell } from '@/components/ui/Table/table'
import {
  DOCUMENT_RESULT_STATUS_LABEL,
  DOCUMENT_RESULTS,
  type DocumentResult,
} from '@/features/recruitment/types'
import { cn } from '@/lib/utils'
import { isOneOf } from '@/utils/isOneOf'
import { OpinionBar, type OpinionCounts } from './opinionBar'
import type { ReactNode } from 'react'

const RESULT_TONE = {
  pass: 'brand',
  hold: 'warning',
  fail: 'critical',
} satisfies Record<DocumentResult, (typeof SEGMENT_TONES)[number]>

const CONFIRMED_RESULT_TONE = {
  pass: 'positive',
  hold: 'warning',
  fail: 'critical',
} satisfies Record<DocumentResult, (typeof BADGE_TONES)[number]>

const COLUMN_CLASS = {
  rank: 'w-9 shrink-0',
  name: 'w-32 shrink-0',
  position: 'w-18 shrink-0',
  opinion: 'w-34 shrink-0',
  // '평균 (5점 만점)' 헤더가 최종 결과 열과 겹치지 않는 최소 폭
  score: 'min-w-24 flex-1',
}

// 평균 열이 없으면 최종 결과가 남는 폭 차지, chevron은 오른쪽 끝 유지
function getResultColumnClass(hasScore: boolean) {
  return hasScore ? 'w-[309px] shrink-0' : 'min-w-[309px] flex-1'
}

const ROW_CLASS = 'flex items-center gap-gap-m px-padding-l py-padding-s'

type ResultTableProps = {
  label: string
  // 지원서 양식에서 점수를 받지 않는 공고는 평균 열 숨김
  hasScore: boolean
  // 로딩 중에는 children 대신 스켈레톤 행 표시
  isLoading?: boolean
  loadingRowCount?: number
  // role=table 밖, 같은 스크롤 영역 안에 표시
  emptyState?: ReactNode
  children?: ReactNode
}

function ResultTable({
  label,
  hasScore,
  isLoading = false,
  loadingRowCount = 0,
  emptyState,
  children,
}: ResultTableProps) {
  const skeletonRowKeys = Array.from({ length: loadingRowCount }, (_, index) => index)

  return (
    <div className="relative overflow-x-auto bg-layer-default">
      {/* 고정 열 폭 합계, 좁은 화면에서는 표 안 가로 스크롤 */}
      <div className={hasScore ? 'min-w-[877px]' : 'min-w-[769px]'}>
        <div role="table" aria-label={label} aria-busy={isLoading} data-slot="result-table">
          <ResultTableHead hasScore={hasScore} />
          {isLoading
            ? skeletonRowKeys.map((key) => <ResultTableSkeletonRow key={key} hasScore={hasScore} />)
            : children}
        </div>
        {!isLoading && emptyState}
      </div>
    </div>
  )
}

function ResultTableHead({ hasScore }: { hasScore: boolean }) {
  return (
    <div role="row" className={cn(ROW_CLASS, 'bg-neutral-weak')}>
      <TableHeadCell className={COLUMN_CLASS.rank}>순위</TableHeadCell>
      <TableHeadCell className={COLUMN_CLASS.name}>지원자</TableHeadCell>
      <TableHeadCell className={COLUMN_CLASS.position}>포지션</TableHeadCell>
      <TableHeadCell
        className={COLUMN_CLASS.opinion}
        actions={
          <InfoPopover
            trigger={<TableHeadAction icon="info" label="평가자 의견 설명 보기" />}
            title="평가자 의견"
            description="운영진이 남긴 합격 · 보류 · 불합격 의견 비율이에요. 막대에 마우스를 올리면 의견별 인원을 볼 수 있어요."
            side="bottom"
            align="start"
            sideOffset={10}
            className="w-90"
          />
        }
      >
        평가자 의견
      </TableHeadCell>
      {hasScore && <TableHeadCell className={COLUMN_CLASS.score}>평균 (5점 만점)</TableHeadCell>}
      <TableHeadCell className={getResultColumnClass(hasScore)}>최종 결과</TableHeadCell>
    </div>
  )
}

type ResultTableRowProps = {
  rank: number
  name: string
  position: string
  opinionCounts: OpinionCounts
  // null은 점수 없는 공고
  averageScore: number | null
  // 확정 전 ResultTableSelector, 확정 후 확정 배지
  result: ReactNode
}

function ResultTableRow({
  rank,
  name,
  position,
  opinionCounts,
  averageScore,
  result,
}: ResultTableRowProps) {
  const hasScore = averageScore !== null

  return (
    <div
      role="row"
      data-slot="result-table-row"
      className={cn(ROW_CLASS, 'min-h-16 border-t border-neutral-subtle bg-layer-default')}
    >
      <span
        role="cell"
        className={cn(COLUMN_CLASS.rank, 'text-label1 font-medium text-neutral-subtle')}
      >
        {rank}
      </span>
      <TableCell type="name" className={COLUMN_CLASS.name}>
        {name}
      </TableCell>
      <TableCell type="text" className={COLUMN_CLASS.position}>
        {position}
      </TableCell>
      <span role="cell" className={cn(COLUMN_CLASS.opinion, 'flex items-center')}>
        <OpinionBar opinionCounts={opinionCounts} />
      </span>
      {/* 만점은 헤더에 표기, 셀에는 숫자만 */}
      {hasScore && (
        <span
          role="cell"
          className={cn(COLUMN_CLASS.score, 'text-headline1 font-semibold text-neutral')}
        >
          {averageScore.toFixed(1)}
        </span>
      )}
      <span
        role="cell"
        className={cn(getResultColumnClass(hasScore), 'flex items-center justify-between')}
      >
        {result}
        <ChevronRightIcon aria-hidden className="size-5 text-neutral-faint" />
      </span>
    </div>
  )
}

type ResultTableSelectorProps = {
  value: DocumentResult
  onValueChange: (value: DocumentResult) => void
  'aria-label': string
}

function ResultTableSelector({ onValueChange, ...props }: ResultTableSelectorProps) {
  function handleValueChange(value: string) {
    if (isOneOf(DOCUMENT_RESULTS, value)) {
      onValueChange(value)
    }
  }

  return (
    <SegmentGroup onValueChange={handleValueChange} className="w-59" {...props}>
      {DOCUMENT_RESULTS.map((result) => (
        <SegmentOption key={result} value={result} tone={RESULT_TONE[result]}>
          {DOCUMENT_RESULT_STATUS_LABEL[result]}
        </SegmentOption>
      ))}
    </SegmentGroup>
  )
}

function ResultTableConfirmedBadge({ result }: { result: DocumentResult }) {
  return (
    <Badge tone={CONFIRMED_RESULT_TONE[result]} variant="weak">
      {DOCUMENT_RESULT_STATUS_LABEL[result]}
    </Badge>
  )
}

// 데이터 요청이 300ms를 넘길 때만 보이도록 호출자가 지연 표시
function ResultTableSkeletonRow({ hasScore }: { hasScore: boolean }) {
  return (
    <div
      aria-hidden
      data-slot="result-table-skeleton-row"
      className={cn(ROW_CLASS, 'h-16 border-t border-neutral-subtle bg-layer-default')}
    >
      <span className={cn(COLUMN_CLASS.rank, 'flex items-center')}>
        <span className="skeleton-bar h-3.5 w-4 rounded-full" />
      </span>
      <span className={cn(COLUMN_CLASS.name, 'flex items-center gap-gap-s')}>
        <span className="skeleton-bar size-7 rounded-full" />
        <span className="skeleton-bar h-3.5 w-14 rounded-full" />
      </span>
      <span className={cn(COLUMN_CLASS.position, 'flex items-center')}>
        <span className="skeleton-bar h-5 w-10 rounded-xs" />
      </span>
      <span className={cn(COLUMN_CLASS.opinion, 'flex items-center')}>
        <span className="skeleton-bar h-1.5 w-30 rounded-full" />
      </span>
      {hasScore && (
        <span className={cn(COLUMN_CLASS.score, 'flex items-center')}>
          <span className="skeleton-bar h-4.5 w-8 rounded-full" />
        </span>
      )}
      <span className={cn(getResultColumnClass(hasScore), 'flex items-center gap-gap-xs')}>
        {DOCUMENT_RESULTS.map((result) => (
          <span key={result} className="skeleton-bar h-8 w-19 rounded-m" />
        ))}
      </span>
    </div>
  )
}

export { ResultTable, ResultTableConfirmedBadge, ResultTableRow, ResultTableSelector }
