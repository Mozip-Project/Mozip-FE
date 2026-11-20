import {
  type PostingApplication,
  type PostingDetail,
  type PostingPosition,
} from '@/features/posting/types'
import {
  formatDday,
  formatMonthDayTimeWithWeekday,
  formatMonthDayWithWeekday,
  getDaysBetween,
  getSeoulIsoDate,
} from '@/utils/date'

type PostingRecruitmentPhase =
  | { status: 'upcoming'; daysLeft: number }
  | { status: 'open'; daysLeft: number }
  | { status: 'closed' }

type PostingSummaryRow = {
  label: string
  value: string
}

// 지원한 포지션 표시가 필요해 글자 대신 포지션 목록 전달
type PostingPositionRow = {
  label: string
  positions: PostingPosition[]
}

type PostingFactRow = PostingSummaryRow | PostingPositionRow

type PostingFactCandidate = { label: string; value: string | null } | PostingPositionRow

// Figma "일정 뱃지" 기준: D-day·D-1 임박, D-2~D-5 가까움, D-6부터 여유
const DEADLINE_IMMINENT_MAX_DAYS = 1
const DEADLINE_SOON_MAX_DAYS = 5

type DeadlineUrgency = 'imminent' | 'soon' | 'relaxed'

const FINAL_RESULT_PENDING_LABEL = '추후 안내'

// 남은 날은 시각과 무관한 한국 날짜 차이(문자열 시간대 표기와 무관), 시각을 읽을 수 없으면 지원을 막도록 마감 처리
function getPostingRecruitmentPhase(
  startsAt: string,
  endsAt: string,
  now: Date,
): PostingRecruitmentPhase {
  const startTime = Date.parse(startsAt)
  const endTime = Date.parse(endsAt)

  if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
    return { status: 'closed' }
  }

  const today = getSeoulIsoDate(now)

  if (now.getTime() < startTime) {
    return {
      status: 'upcoming',
      daysLeft: getDaysBetween(today, getSeoulIsoDate(new Date(startTime))),
    }
  }

  if (now.getTime() <= endTime) {
    return { status: 'open', daysLeft: getDaysBetween(today, getSeoulIsoDate(new Date(endTime))) }
  }

  return { status: 'closed' }
}

function hasValue(row: { label: string; value: string | null }): row is PostingSummaryRow {
  return row.value !== null && row.value !== ''
}

function isFilledFactRow(row: PostingFactCandidate): row is PostingFactRow {
  return 'positions' in row ? row.positions.length > 0 : hasValue(row)
}

// 값이 빈 행 생략, 포지션 없는 모집은 모집 포지션 행도 생략
function getPostingFactRows(detail: PostingDetail): PostingFactRow[] {
  const { application, interview } = detail
  const rows: PostingFactCandidate[] = [
    {
      label: '모집 포지션',
      positions: application.type === 'byPosition' ? application.positions : [],
    },
    { label: '면접', value: interview ? '있음' : '없음' },
    { label: '지원 자격', value: detail.eligibility },
    { label: '활동 지역', value: detail.activityArea },
    { label: '회비', value: detail.membershipFee },
  ]

  return rows.filter(isFilledFactRow)
}

// 입력된 단계만 표시, 최종 결과일은 미입력이어도 '추후 안내'로 표시
function getPostingScheduleRows(detail: PostingDetail): PostingSummaryRow[] {
  const recruitmentPeriod = {
    label: '지원 기간',
    value: `${formatMonthDayTimeWithWeekday(detail.recruitmentStartsAt)} ~ ${formatMonthDayTimeWithWeekday(detail.recruitmentEndsAt)}`,
  }
  const finalResult = detail.finalResultDate
    ? formatMonthDayWithWeekday(detail.finalResultDate)
    : FINAL_RESULT_PENDING_LABEL
  const { interview } = detail

  // TODO: 포지션 없는 모집(학생회) Figma 갱신 후 '결과 발표' 이름 확인
  if (!interview) {
    return [recruitmentPeriod, { label: '결과 발표', value: finalResult }]
  }

  return [
    recruitmentPeriod,
    {
      label: '서류 결과',
      value: detail.documentResultDate && formatMonthDayWithWeekday(detail.documentResultDate),
    },
    {
      label: '면접 기간',
      value: `${formatMonthDayWithWeekday(interview.startDate)} ~ ${formatMonthDayWithWeekday(interview.endDate)}`,
    },
    { label: '최종 결과', value: finalResult },
  ].filter(hasValue)
}

function hasAppliedPosting(application: PostingApplication) {
  if (application.type === 'direct') {
    return application.appliedAt !== null
  }

  return application.positions.some((position) => position.appliedAt !== null)
}

// 더 지원할 수 있는 포지션이 없음, 포지션 없는 모집은 지원 여부 그대로
function hasCompletedApplication(application: PostingApplication) {
  if (application.type === 'direct') {
    return application.appliedAt !== null
  }

  const { positions } = application

  return positions.length > 0 && positions.every((position) => position.appliedAt !== null)
}

// Figma 헤더 상태 칩 문구, 마감·시작 당일은 D-day
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

function getDeadlineUrgency(daysLeft: number): DeadlineUrgency {
  if (daysLeft <= DEADLINE_IMMINENT_MAX_DAYS) {
    return 'imminent'
  }

  if (daysLeft <= DEADLINE_SOON_MAX_DAYS) {
    return 'soon'
  }

  return 'relaxed'
}

export {
  getDeadlineUrgency,
  getPostingFactRows,
  getPostingRecruitmentPhase,
  getPostingScheduleRows,
  getRecruitmentStatusLabel,
  hasAppliedPosting,
  hasCompletedApplication,
}
export type { DeadlineUrgency, PostingRecruitmentPhase, PostingSummaryRow }
