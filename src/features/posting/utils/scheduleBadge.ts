import type { Badge } from '@/components/ui/Badge/badge'
import type { PostingRecruitmentPhase } from '@/features/posting/types'
import { formatDday } from '@/utils/date'
import type { ComponentProps } from 'react'

type BadgeProps = ComponentProps<typeof Badge>
type BadgeTone = NonNullable<BadgeProps['tone']>

// Figma 일정 뱃지(전체 적용) 기준: D-DAY·D-1 임박, D-2~D-5 가까움, D-6부터 여유
const DEADLINE_IMMINENT_MAX_DAYS = 1
const DEADLINE_SOON_MAX_DAYS = 5

type DeadlineUrgency = 'imminent' | 'soon' | 'relaxed'

const DEADLINE_BADGE_TONE = {
  imminent: 'critical',
  soon: 'warning',
  relaxed: 'informative',
} satisfies Record<DeadlineUrgency, BadgeTone>

function getDeadlineUrgency(daysLeft: number): DeadlineUrgency {
  if (daysLeft <= DEADLINE_IMMINENT_MAX_DAYS) {
    return 'imminent'
  }

  if (daysLeft <= DEADLINE_SOON_MAX_DAYS) {
    return 'soon'
  }

  return 'relaxed'
}

// 마감·시작 당일은 D-DAY
function getRecruitmentStatusLabel(phase: PostingRecruitmentPhase) {
  switch (phase.status) {
    case 'open':
      return `마감 ${formatDday(phase.daysLeft)}`
    case 'upcoming':
      return `모집 예정 ${formatDday(phase.daysLeft)}`
    case 'closed':
      return '모집 마감'
  }
}

function getScheduleBadgeProps(daysLeft: number, label: string) {
  return {
    tone: DEADLINE_BADGE_TONE[getDeadlineUrgency(daysLeft)],
    variant: 'weak',
    children: `${label} ${formatDday(daysLeft)}`,
  } satisfies BadgeProps
}

// 마감 후에는 남은 날이 없어 회색
function getRecruitmentStatusBadgeProps(phase: PostingRecruitmentPhase) {
  return {
    tone:
      phase.status === 'closed'
        ? 'neutral'
        : DEADLINE_BADGE_TONE[getDeadlineUrgency(phase.daysLeft)],
    variant: 'weak',
    children: getRecruitmentStatusLabel(phase),
  } satisfies BadgeProps
}

export {
  getDeadlineUrgency,
  getRecruitmentStatusBadgeProps,
  getRecruitmentStatusLabel,
  getScheduleBadgeProps,
}
