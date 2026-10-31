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
  // 필터·검색 적용 후 전체 탭 인원, 조건이 없을 때 0이면 모집에 지원자가 없음
  totalCount: number
  keyword: string
  // 포지션 필터가 걸린 경우에만 전달, 결과가 0명이면 필터 초기화 안내 표시
  resetFilterHref?: Route
}

const EMPTY_STATE_CLASS = 'rounded-none border-0'

type EmptyStateContext = Pick<
  DocumentReviewApplicantTableProps,
  'recruitmentId' | 'status' | 'totalCount' | 'keyword' | 'resetFilterHref'
>

// 조건(검색·포지션)에 맞는 전체 인원으로 원인 구분
// 1명 이상이면 탭 상태(평가 모두 완료), 0명이면 검색어 → 포지션 필터 → 지원자 없음 순
function getEmptyState({
  recruitmentId,
  status,
  totalCount,
  keyword,
  resetFilterHref,
}: EmptyStateContext) {
  // 조건에 맞는 지원자가 있는데 이 탭만 비었으면 탭 상태가 원인
  if (totalCount > 0) {
    if (status === 'pending') {
      // typedRoutes는 리터럴만 검사하므로 Next 문서 안내대로 조합한 경로를 Route로 단언
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

    // TODO: 평가 완료 탭이 0명(아직 평가 전)일 때의 빈 상태는 Figma 미정의
    return null
  }

  // 조건에 맞는 지원자가 아예 없으면 검색어 → 포지션 필터 → 지원자 없음 순으로 원인 안내
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

// TODO: 서류 평가 마감 후 '평가 수정' 버튼 상태는 디자이너 확인 후 canEditDocumentReview로 분기
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
          // typedRoutes는 리터럴만 검사하므로 Next 문서 안내대로 조합한 경로를 Route로 단언
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
