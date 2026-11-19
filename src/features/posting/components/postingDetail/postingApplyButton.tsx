import Link from 'next/link'
import { Button } from '@/components/ui/Button/button'
import type { PostingApplication } from '@/features/posting/types'
import {
  hasCompletedApplication,
  type PostingRecruitmentPhase,
} from '@/features/posting/utils/postingDetail'

type PostingApplyButtonProps = {
  application: PostingApplication
  phase: PostingRecruitmentPhase
}

function PostingApplyButton({ application, phase }: PostingApplyButtonProps) {
  // 더 지원할 포지션이 없음
  if (hasCompletedApplication(application)) {
    return (
      <Button asChild variant="secondary" size="m">
        <Link href="/applications">내 지원에서 보기</Link>
      </Button>
    )
  }

  if (phase.status === 'upcoming') {
    return (
      <Button size="m" disabled>
        모집 예정
      </Button>
    )
  }

  if (phase.status === 'closed') {
    return (
      <Button size="m" disabled>
        모집 마감
      </Button>
    )
  }

  // TODO: 지원서 작성 경로 확정 후 이동 연결
  return <Button size="m">지원하기</Button>
}

export { PostingApplyButton }
