import ChevronRightIcon from '@/assets/icons/chevronRight.svg'
import { Badge, type BADGE_TONES } from '@/components/ui/Badge/badge'
import { InfoPopover } from '@/components/ui/InfoPopover/infoPopover'
import { SegmentGroup } from '@/components/ui/SegmentGroup/segmentGroup'
import { SegmentOption, type SEGMENT_TONES } from '@/components/ui/SegmentGroup/segmentOption'
import { TableCell, TableHeadAction, TableHeadCell } from '@/components/ui/Table/table'
import {
  DOCUMENT_RESULT_PAGE_SIZE,
  DOCUMENT_RESULT_STATUS_LABEL,
  DOCUMENT_RESULTS,
  type DocumentResult,
  type DocumentResultApplicant,
} from '@/features/recruitment/types'
import { cn } from '@/lib/utils'
import { isOneOf } from '@/utils/isOneOf'
import { OpinionBar } from './opinionBar'
import type { ReactNode } from 'react'

const TABLE_LABEL = '서류 평가 취합 결과'
const ROW_CLASS = 'flex items-center gap-gap-m px-padding-l py-padding-s'
const COLUMN_CLASS = {
  rank: 'w-9 shrink-0',
  name: 'w-32 shrink-0',
  position: 'w-18 shrink-0',
  opinion: 'w-34 shrink-0',
  score: 'min-w-24 flex-1',
  result: 'w-[309px] shrink-0',
}
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
// 순위·평균이 아직 없을 때 표시
const EMPTY_VALUE = '–'
const SKELETON_ROW_KEYS = Array.from({ length: DOCUMENT_RESULT_PAGE_SIZE }, (_, index) => index)

type DocumentResultTableProps = {
  isConfirmed: boolean
  hasPositions: boolean
  applicants: readonly DocumentResultApplicant[]
  onResultChange: (applicantId: string, result: DocumentResult) => void
  // 지원자가 0명일 때만 표시
  emptyState: ReactNode
}

// 확정 전에는 결과 선택, 확정 후에는 확정 배지
// TODO: 운영진 의견 페이지 경로 확정 후 행 클릭 이동 연결
function DocumentResultTable({
  isConfirmed,
  hasPositions,
  applicants,
  onResultChange,
  emptyState,
}: DocumentResultTableProps) {
  return (
    <div className="relative overflow-x-auto bg-layer-default">
      {/* 고정 열 폭 합계, 좁은 화면에서는 표 안 가로 스크롤 */}
      <div className="min-w-[877px]">
        <div role="table" aria-label={TABLE_LABEL} aria-busy={false} data-slot="result-table">
          <TableHead hasPositions={hasPositions} />

          {applicants.map((applicant) => {
            const { id, name, positionName, rank, opinionCounts, averageScore, result } = applicant

            return (
              <div
                key={id}
                role="row"
                data-slot="result-table-row"
                className={cn(
                  ROW_CLASS,
                  'min-h-16 border-t border-neutral-subtle bg-layer-default',
                )}
              >
                <span
                  role="cell"
                  className={cn(COLUMN_CLASS.rank, 'text-label1 font-medium text-neutral-subtle')}
                >
                  {rank ?? EMPTY_VALUE}
                </span>

                <TableCell type="name" className={COLUMN_CLASS.name}>
                  {name}
                </TableCell>

                {hasPositions ? (
                  <TableCell type="text" className={COLUMN_CLASS.position}>
                    {positionName ?? ''}
                  </TableCell>
                ) : (
                  <span aria-hidden className={COLUMN_CLASS.position} />
                )}

                <span role="cell" className={cn(COLUMN_CLASS.opinion, 'flex items-center')}>
                  <OpinionBar opinionCounts={opinionCounts} />
                </span>

                {/* 만점은 헤더에 표기, 셀에는 숫자만 */}
                <span
                  role="cell"
                  className={cn(COLUMN_CLASS.score, 'text-headline1 font-semibold text-neutral')}
                >
                  {averageScore?.toFixed(1) ?? EMPTY_VALUE}
                </span>

                <span
                  role="cell"
                  className={cn(COLUMN_CLASS.result, 'flex items-center justify-between')}
                >
                  {isConfirmed ? (
                    result && <ConfirmedResultBadge result={result} />
                  ) : (
                    // TODO: 평가 진행 중이라 선택할 수 없는 이유 안내 디자인 확인 필요
                    <ResultSelector
                      aria-label={`${name} 최종 결과`}
                      value={result}
                      disabled={!applicant.isEvaluationComplete}
                      onValueChange={(nextResult) => onResultChange(id, nextResult)}
                    />
                  )}
                  <ChevronRightIcon aria-hidden className="size-5 text-neutral-faint" />
                </span>
              </div>
            )
          })}
        </div>

        {applicants.length === 0 && emptyState}
      </div>
    </div>
  )
}

function TableHead({ hasPositions }: { hasPositions: boolean }) {
  return (
    <div role="row" className={cn(ROW_CLASS, 'bg-neutral-weak')}>
      <TableHeadCell className={COLUMN_CLASS.rank}>순위</TableHeadCell>
      <TableHeadCell className={COLUMN_CLASS.name}>지원자</TableHeadCell>
      {hasPositions ? (
        <TableHeadCell className={COLUMN_CLASS.position}>포지션</TableHeadCell>
      ) : (
        <span aria-hidden className={COLUMN_CLASS.position} />
      )}
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
      <TableHeadCell className={COLUMN_CLASS.score}>평균 (5점 만점)</TableHeadCell>
      <TableHeadCell className={COLUMN_CLASS.result}>최종 결과</TableHeadCell>
    </div>
  )
}

type ResultSelectorProps = {
  // 아직 고르지 않았으면 null
  value: DocumentResult | null
  onValueChange: (value: DocumentResult) => void
  disabled: boolean
  'aria-label': string
}

function ResultSelector({ value, onValueChange, ...props }: ResultSelectorProps) {
  function handleValueChange(value: string) {
    if (isOneOf(DOCUMENT_RESULTS, value)) {
      onValueChange(value)
    }
  }

  return (
    <SegmentGroup value={value ?? ''} onValueChange={handleValueChange} className="w-59" {...props}>
      {DOCUMENT_RESULTS.map((result) => (
        <SegmentOption key={result} value={result} tone={RESULT_TONE[result]}>
          {DOCUMENT_RESULT_STATUS_LABEL[result]}
        </SegmentOption>
      ))}
    </SegmentGroup>
  )
}

function ConfirmedResultBadge({ result }: { result: DocumentResult }) {
  return (
    <Badge tone={CONFIRMED_RESULT_TONE[result]} variant="weak">
      {DOCUMENT_RESULT_STATUS_LABEL[result]}
    </Badge>
  )
}

// 데이터 요청이 300ms를 넘길 때만 보이도록 호출자가 지연 표시, 첫 진입은 포지션 있는 공고 기준
function DocumentResultSkeletonTable({ hasPositions = true }: { hasPositions?: boolean }) {
  return (
    <div className="relative overflow-x-auto bg-layer-default">
      <div className="min-w-[877px]">
        <div role="table" aria-label={TABLE_LABEL} aria-busy={true} data-slot="result-table">
          <TableHead hasPositions={hasPositions} />

          {SKELETON_ROW_KEYS.map((key) => (
            <div
              key={key}
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
                {hasPositions && <span className="skeleton-bar h-5 w-10 rounded-xs" />}
              </span>
              <span className={cn(COLUMN_CLASS.opinion, 'flex items-center')}>
                <span className="skeleton-bar h-1.5 w-30 rounded-full" />
              </span>
              <span className={cn(COLUMN_CLASS.score, 'flex items-center')}>
                <span className="skeleton-bar h-4.5 w-8 rounded-full" />
              </span>
              <span className={cn(COLUMN_CLASS.result, 'flex items-center gap-gap-xs')}>
                {DOCUMENT_RESULTS.map((result) => (
                  <span key={result} className="skeleton-bar h-8 w-19 rounded-m" />
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export { DocumentResultSkeletonTable, DocumentResultTable }
