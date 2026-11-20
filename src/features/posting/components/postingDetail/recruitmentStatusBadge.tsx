import { Badge, type BADGE_TONES } from '@/components/ui/Badge/badge'
import {
  getDeadlineUrgency,
  getRecruitmentStatusLabel,
  type DeadlineUrgency,
  type PostingRecruitmentPhase,
} from '@/features/posting/utils/postingDetail'

type BadgeTone = (typeof BADGE_TONES)[number]

const DEADLINE_BADGE_TONE = {
  imminent: 'critical',
  soon: 'warning',
  relaxed: 'informative',
} satisfies Record<DeadlineUrgency, BadgeTone>

function getStatusBadgeTone(phase: PostingRecruitmentPhase): BadgeTone {
  switch (phase.status) {
    case 'open':
    case 'upcoming':
      return DEADLINE_BADGE_TONE[getDeadlineUrgency(phase.daysLeft)]
    case 'closed':
      return 'neutral'
  }
}

type RecruitmentStatusBadgeProps = {
  phase: PostingRecruitmentPhase
  className?: string
}

function RecruitmentStatusBadge({ phase, className }: RecruitmentStatusBadgeProps) {
  return (
    <Badge tone={getStatusBadgeTone(phase)} variant="weak" className={className}>
      {getRecruitmentStatusLabel(phase)}
    </Badge>
  )
}

export { RecruitmentStatusBadge }
