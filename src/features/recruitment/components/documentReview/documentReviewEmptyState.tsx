import Link from 'next/link'
import ArrowRightIcon from '@/assets/icons/arrowRight.svg'
import CheckIcon from '@/assets/icons/check.svg'
import ChevronRightIcon from '@/assets/icons/chevronRight.svg'
import FileTextIcon from '@/assets/icons/fileText.svg'
import FilterIcon from '@/assets/icons/filter.svg'
import LinkIcon from '@/assets/icons/link.svg'
import UsersIcon from '@/assets/icons/users.svg'
import { Button } from '@/components/ui/Button/button'
import { RecruitmentBoardEmptyState } from '@/features/recruitment/components/recruitmentBoard/recruitmentBoardEmptyState'
import { RecruitmentBoardFilterEmptyState } from '@/features/recruitment/components/recruitmentBoard/recruitmentBoardFilterEmptyState'
import { RecruitmentBoardSearchEmptyState } from '@/features/recruitment/components/recruitmentBoard/recruitmentBoardSearchEmptyState'
import type { DocumentReviewStatus } from '@/features/recruitment/types'
import { getDocumentResultPath } from '@/features/recruitment/utils/recruitmentRoutes'
import type { Route } from 'next'

type DocumentReviewEmptyStateProps = {
  recruitmentId: string
  status: DocumentReviewStatus
  // 필터·검색 적용 후 전체 탭 인원
  totalCount: number
  keyword: string
  isPositionFiltered: boolean
  // 평가 완료 탭이 비었을 때 평가 전 첫 지원자의 평가 화면
  startReviewHref?: Route
}

// 조건에 맞는 인원이 있으면 탭 상태, 없으면 검색어 → 포지션 필터 → 지원자 없음 순으로 원인 안내
function DocumentReviewEmptyState({
  recruitmentId,
  status,
  totalCount,
  keyword,
  isPositionFiltered,
  startReviewHref,
}: DocumentReviewEmptyStateProps) {
  if (totalCount > 0) {
    if (status === 'pending') {
      return (
        <RecruitmentBoardEmptyState
          icon={<CheckIcon className="size-7" />}
          title="모든 지원서 평가를 마쳤어요"
          description="다른 평가자의 진행 상황과 최종 결과는 '평가 결과 취합'에서 확인할 수 있어요."
          actions={
            <Button asChild size="m">
              <Link href={getDocumentResultPath(recruitmentId)}>
                <ArrowRightIcon aria-hidden />
                평가 결과 취합으로 이동
              </Link>
            </Button>
          }
        />
      )
    }

    if (status === 'done') {
      return (
        <RecruitmentBoardEmptyState
          icon={<FileTextIcon className="size-7" />}
          title="아직 평가한 지원자가 없어요"
          description="평가를 마친 지원자가 이곳에 모여요"
          actions={
            startReviewHref && (
              <Button asChild size="m">
                <Link href={startReviewHref}>
                  평가 시작하기
                  <ChevronRightIcon aria-hidden />
                </Link>
              </Button>
            )
          }
        />
      )
    }

    return null
  }

  if (keyword !== '') {
    return <RecruitmentBoardSearchEmptyState keyword={keyword} clearLabel="검색어 삭제" />
  }

  if (isPositionFiltered) {
    return (
      <RecruitmentBoardFilterEmptyState
        icon={<FilterIcon className="size-7" />}
        description="선택한 포지션에 평가할 지원서가 없어요. 다른 포지션을 고르거나 필터를 초기화해 보세요."
      />
    )
  }

  return (
    <RecruitmentBoardEmptyState
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
    />
  )
}

export { DocumentReviewEmptyState }
