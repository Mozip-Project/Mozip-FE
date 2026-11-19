import { Badge, type BADGE_TONES } from '@/components/ui/Badge/badge'
import {
  getRecruitmentStatusLabel,
  type PostingRecruitmentPhase,
} from '@/features/posting/utils/postingDetail'

const STATUS_BADGE_TONE = {
  open: 'critical',
  upcoming: 'warning',
  closed: 'neutral',
} satisfies Record<PostingRecruitmentPhase['status'], (typeof BADGE_TONES)[number]>

type RecruitmentStatusBadgeProps = {
  phase: PostingRecruitmentPhase
  className?: string
}

function RecruitmentStatusBadge({ phase, className }: RecruitmentStatusBadgeProps) {
  return (
    <Badge tone={STATUS_BADGE_TONE[phase.status]} variant="weak" className={className}>
      {getRecruitmentStatusLabel(phase)}
    </Badge>
  )
}

export { RecruitmentStatusBadge }
