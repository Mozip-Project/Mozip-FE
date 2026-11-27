import type {
  PostingDetail,
  PostingQuestionPreview,
  PostingRecruitmentPhase,
} from '@/features/posting/types'
import { parsePostingContentHtml } from '@/features/posting/utils/postingContent'
import type { PostingQuery } from '@/gql/graphql'
import {
  formatMonthDayTimeWithWeekday,
  formatMonthDayWithWeekday,
  getDaysBetween,
  getSeoulIsoDate,
} from '@/utils/date'
import { formatThousands } from '@/utils/number'

type PostingResponse = PostingQuery['posting']

type PostingSummaryRow = {
  label: string
  value: string
}

const FINAL_RESULT_PENDING_LABEL = '추후 안내'

// 서버 문항이 아니라 면접 있는 모집에 프론트가 추가
const INTERVIEW_AVAILABILITY_QUESTION = {
  id: 'interview-availability',
  title: '면접 가능 시간 선택',
} satisfies PostingQuestionPreview

// 남은 날은 한국 날짜 기준, 시각이 없으면 마감 처리
function getPostingRecruitmentPhase(
  startsAt: string | null,
  endsAt: string | null,
  now: Date,
): PostingRecruitmentPhase {
  const startTime = startsAt ? Date.parse(startsAt) : Number.NaN
  const endTime = endsAt ? Date.parse(endsAt) : Number.NaN

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

function toSeoulDate(dateTime: string | null) {
  const time = dateTime ? Date.parse(dateTime) : Number.NaN
  return Number.isNaN(time) ? null : getSeoulIsoDate(new Date(time))
}

// 작성 폼은 숫자만 저장, 다른 형식으로 들어온 값은 그대로 표시
function formatFee(fee: string | null) {
  return fee && /^\d+$/.test(fee) ? formatThousands(fee) : fee
}

function getEligibility({
  allowEnrolled,
  allowOnLeave,
  eligibilityNote,
}: Pick<PostingResponse, 'allowEnrolled' | 'allowOnLeave' | 'eligibilityNote'>) {
  const statuses: string[] = []
  if (allowEnrolled) {
    statuses.push('대학생')
  }
  if (allowOnLeave) {
    statuses.push('휴학생')
  }

  const statusLabel = statuses.join(' · ')
  const note = eligibilityNote?.trim()

  if (!note) {
    return statusLabel || null
  }
  return statusLabel ? `${statusLabel} (${note})` : note
}

function getInterviewPeriod(ranges: PostingResponse['interviewTimeRanges']) {
  const dates = ranges.map(({ date }) => date).toSorted()
  const startDate = dates[0]
  const endDate = dates.at(-1)

  return startDate && endDate ? { startDate, endDate } : null
}

function getCoverImageUrl(images: PostingResponse['images']) {
  const coverImage =
    images.find(({ isRepresentative }) => isRepresentative) ??
    images.toSorted((a, b) => a.sortOrder - b.sortOrder)[0]

  return coverImage?.url ?? null
}

function toPostingDetail(posting: PostingResponse): PostingDetail {
  const { organization } = posting
  const sortedQuestions = posting.questions.toSorted((a, b) => a.sortOrder - b.sortOrder)
  const interviewQuestions = posting.hasInterview ? [INTERVIEW_AVAILABILITY_QUESTION] : []

  // 공통 문항(position null) 포함
  function getQuestionPreviews(positionId: string | null): PostingQuestionPreview[] {
    const questions = sortedQuestions
      .filter(({ position }) => positionId === null || !position || position.id === positionId)
      .map(({ id, title }) => ({ id, title }))

    return [...questions, ...interviewQuestions]
  }

  return {
    id: posting.id,
    title: posting.title,
    organization: {
      name: organization.name,
      logoUrl: organization.logoUrl,
      type: organization.type,
      tagline: organization.tagline,
      fields: organization.fields,
      keywords: organization.keywords,
      links: organization.links.map(({ url }) => url),
      ongoingPostings: posting.otherActivePostings.map(
        ({ id, title, recruitStartAt, recruitEndAt }) => ({
          postingId: id,
          title,
          recruitmentStartsAt: recruitStartAt,
          recruitmentEndsAt: recruitEndAt,
        }),
      ),
    },
    hasInterview: posting.hasInterview,
    interviewPeriod: posting.hasInterview ? getInterviewPeriod(posting.interviewTimeRanges) : null,
    eligibility: getEligibility(posting),
    activityArea: posting.region,
    membershipFee: formatFee(posting.fee),
    recruitmentStartsAt: posting.recruitStartAt,
    recruitmentEndsAt: posting.recruitEndAt,
    documentResultDate: toSeoulDate(posting.docResultAt),
    finalResultDate: toSeoulDate(posting.finalResultAt),
    coverImageUrl: getCoverImageUrl(posting.images),
    content: parsePostingContentHtml(posting.content),
    positions: posting.noPosition
      ? []
      : posting.positions
          .toSorted((a, b) => a.sortOrder - b.sortOrder)
          .map(({ id, name }) => ({ id, name, questions: getQuestionPreviews(id) })),
    questions: getQuestionPreviews(null),
  }
}

function hasValue(row: { label: string; value: string | null }): row is PostingSummaryRow {
  return row.value !== null && row.value !== ''
}

function formatResultDate(date: string | null) {
  return date ? formatMonthDayWithWeekday(date) : FINAL_RESULT_PENDING_LABEL
}

function getPostingFactRows(detail: PostingDetail): PostingSummaryRow[] {
  const rows = [
    { label: '모집 포지션', value: detail.positions.map(({ name }) => name).join(', ') },
    { label: '면접', value: detail.hasInterview ? '있음' : '없음' },
    { label: '지원 자격', value: detail.eligibility },
    { label: '활동 지역', value: detail.activityArea },
    { label: '회비', value: detail.membershipFee },
  ]

  return rows.filter(hasValue)
}

function getPostingScheduleRows(detail: PostingDetail): PostingSummaryRow[] {
  const { recruitmentStartsAt, recruitmentEndsAt, interviewPeriod } = detail
  const recruitmentPeriod = {
    label: '모집 기간',
    value:
      recruitmentStartsAt && recruitmentEndsAt
        ? `${formatMonthDayTimeWithWeekday(recruitmentStartsAt)} ~ ${formatMonthDayTimeWithWeekday(recruitmentEndsAt)}`
        : null,
  }

  // 면접 없는 모집은 서류 결과일이 결과 발표일
  // TODO: 포지션 없는 모집(학생회) Figma 갱신 후 '결과 발표' 이름 확인
  if (!detail.hasInterview) {
    return [
      recruitmentPeriod,
      { label: '결과 발표', value: formatResultDate(detail.documentResultDate) },
    ].filter(hasValue)
  }

  return [
    recruitmentPeriod,
    {
      label: '서류 결과',
      value: detail.documentResultDate && formatMonthDayWithWeekday(detail.documentResultDate),
    },
    {
      label: '면접 기간',
      value:
        interviewPeriod &&
        `${formatMonthDayWithWeekday(interviewPeriod.startDate)} ~ ${formatMonthDayWithWeekday(interviewPeriod.endDate)}`,
    },
    { label: '최종 결과', value: formatResultDate(detail.finalResultDate) },
  ].filter(hasValue)
}

export { getPostingFactRows, getPostingRecruitmentPhase, getPostingScheduleRows, toPostingDetail }
export type { PostingSummaryRow }
