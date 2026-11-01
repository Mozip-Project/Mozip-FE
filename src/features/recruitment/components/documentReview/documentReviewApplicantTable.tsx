import Link from 'next/link'
import ArrowRightIcon from '@/assets/icons/arrowRight.svg'
import CheckIcon from '@/assets/icons/check.svg'
import FilterIcon from '@/assets/icons/filter.svg'
import LinkIcon from '@/assets/icons/link.svg'
import SearchIcon from '@/assets/icons/search.svg'
import UsersIcon from '@/assets/icons/users.svg'
import { Button } from '@/components/ui/Button/button'
import { EmptyState } from '@/components/ui/EmptyState/emptyState'
import {
  DOCUMENT_REVIEW_POSITION_LABEL,
  type DocumentReviewApplicant,
  type DocumentReviewStatus,
} from '@/features/recruitment/api/organizer'
import { formatMonthDayWithWeekday } from '@/utils/date'
import { ApplicantRow, ApplicantTable, ApplicantTableHead } from './applicantTable'
import { DocumentReviewSearchClearButton } from './documentReviewBoard'
import { DocumentReviewFilterResetButton } from './documentReviewFilterResetButton'
import type { Route } from 'next'

type DocumentReviewApplicantTableProps = {
  recruitmentId: string
  applicants: readonly DocumentReviewApplicant[]
  status: DocumentReviewStatus
  // 필터·검색 적용 후 전체 탭 인원
  totalCount: number
  keyword: string
  // 포지션 필터가 걸린 경우에만 전달
  resetFilterHref?: Route
}

const EMPTY_STATE_CLASS = 'rounded-none border-0'

type EmptyStateContext = Pick<
  DocumentReviewApplicantTableProps,
  'recruitmentId' | 'status' | 'totalCount' | 'keyword' | 'resetFilterHref'
>

// 조건에 맞는 인원이 있으면 탭 상태, 없으면 검색어 → 포지션 필터 → 지원자 없음 순으로 원인 안내
function getEmptyState({
  recruitmentId,
  status,
  totalCount,
  keyword,
  resetFilterHref,
}: EmptyStateContext) {
  if (totalCount > 0) {
    if (status === 'pending') {
      // typedRoutes는 리터럴만 검사, Next 문서 안내대로 Route 단언
      const summaryHref = `/manage/recruitments/${recruitmentId}/documents/summary` as Route

      return (
        <EmptyState
          icon={<CheckIcon className="size-7" />}
          title="모든 지원서 평가를 마쳤어요"
          description="다른 평가자의 진행 상황과 최종 결과는 '평가 결과 취합'에서 확인할 수 있어요."
          actions={
            <Button asChild size="m">
              <Link href={summaryHref}>
                <ArrowRightIcon aria-hidden />
                평가 결과 취합으로 이동
              </Link>
            </Button>
          }
          className={EMPTY_STATE_CLASS}
        />
      )
    }

    // TODO: 평가 완료 탭 0명 빈 상태는 Figma 확정 후 추가
    return null
  }

  if (keyword !== '') {
    return (
      <EmptyState
        icon={<SearchIcon className="size-7" />}
        title={`'${keyword}'에 해당하는 지원자가 없어요`}
        description="이름을 다시 확인하거나 다른 검색어로 찾아보세요."
        actions={<DocumentReviewSearchClearButton />}
        className={EMPTY_STATE_CLASS}
      />
    )
  }

  if (resetFilterHref) {
    return (
      <EmptyState
        icon={<FilterIcon className="size-7" />}
        title="조건에 맞는 지원자가 없어요"
        description="선택한 포지션에 평가할 지원서가 없어요. 다른 포지션을 고르거나 필터를 초기화해 보세요."
        actions={<DocumentReviewFilterResetButton href={resetFilterHref} />}
        className={EMPTY_STATE_CLASS}
      />
    )
  }

  return (
    <EmptyState
      icon={<UsersIcon className="size-7" />}
      title="아직 지원자가 없어요"
      description="지원 접수가 시작되면 이곳에 지원자가 표시돼요. 공고 링크를 공유해 지원자를 모아보세요."
      actions={
        // TODO: 지원자용 공고 상세 경로와 복사 완료 안내 확정 후 클립보드 복사 연결
        <Button variant="secondary" size="m">
          <LinkIcon aria-hidden />
          공고 링크 복사
        </Button>
      }
      className={EMPTY_STATE_CLASS}
    />
  )
}

// TODO: 마감 후 '평가 수정' 버튼 상태는 Figma 확정 후 canEditDocumentReview로 분기
function DocumentReviewApplicantTable({
  recruitmentId,
  applicants,
  status,
  totalCount,
  keyword,
  resetFilterHref,
}: DocumentReviewApplicantTableProps) {
  const emptyState =
    applicants.length === 0
      ? getEmptyState({ recruitmentId, status, totalCount, keyword, resetFilterHref })
      : null

  return (
    <ApplicantTable
      label="서류 평가 지원자 목록"
      emptyState={
        // 조건 변경 결과를 화면 이동 없이 알림
        emptyState && <div role="status">{emptyState}</div>
      }
    >
      <ApplicantTableHead />
      {applicants.map((applicant) => (
        <ApplicantRow
          key={applicant.id}
          // typedRoutes는 리터럴만 검사, Next 문서 안내대로 Route 단언
          href={`/manage/recruitments/${recruitmentId}/documents/${applicant.id}` as Route}
          name={applicant.name}
          position={DOCUMENT_REVIEW_POSITION_LABEL[applicant.position]}
          submittedAt={formatMonthDayWithWeekday(applicant.submittedAt)}
          isEvaluated={applicant.isEvaluated}
        />
      ))}
    </ApplicantTable>
  )
}

export { DocumentReviewApplicantTable }
