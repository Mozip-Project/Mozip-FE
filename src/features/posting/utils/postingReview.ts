import type { PostingCreateValues } from '@/features/posting/schemas/postingCreateValues'
import type { Qualification } from '@/features/posting/schemas/postingInfoSchema'
import { formatMonthDayWithWeekday } from '@/utils/date'
import { formatThousands } from '@/utils/number'
import { getDefaultTime } from '@/utils/time'

const QUALIFICATION_LABEL = {
  student: '대학생',
  leaveOfAbsence: '휴학생',
  custom: '직접 입력',
} satisfies Record<Qualification, string>

type ReviewRow = { label: string; value: string }
type ScheduleItem = { label: string; value: string; caption?: string }

// 직접 입력은 선택한 자격 뒤 괄호로, 단독이면 입력 문구만
function getQualificationText(qualifications: Qualification[], customQualification: string) {
  const labels = qualifications
    .filter((qualification) => qualification !== 'custom')
    .map((qualification) => QUALIFICATION_LABEL[qualification])
    .join('/')
  const custom = qualifications.includes('custom') ? customQualification.trim() : ''

  if (!custom) {
    return labels
  }
  return labels ? `${labels} (${custom})` : custom
}

function formatFee(fee: string) {
  return `${formatThousands(fee)}원`
}

// 1단계에서 공개하기로 한 항목만 표시
function getPostingInfoRows(values: PostingCreateValues): ReviewRow[] {
  return [
    { label: '공고명', value: values.title.trim() },
    ...(values.publicItems.includes('region')
      ? [{ label: '활동 지역', value: values.region.trim() }]
      : []),
    ...(values.publicItems.includes('fee')
      ? [{ label: '회비', value: formatFee(values.fee) }]
      : []),
    {
      label: '지원 자격',
      value: getQualificationText(values.qualifications, values.customQualification),
    },
  ]
}

function formatDateRange(startDate: string, endDate: string) {
  return startDate === endDate
    ? formatMonthDayWithWeekday(startDate)
    : `${formatMonthDayWithWeekday(startDate)} ~ ${formatMonthDayWithWeekday(endDate)}`
}

function getScheduleItems(values: PostingCreateValues, hasInterview: boolean): ScheduleItem[] {
  const { recruitStartDate, recruitEndDate, documentResultDate, finalResultDate } = values
  const items: ScheduleItem[] = []

  if (recruitStartDate && recruitEndDate) {
    items.push({
      label: '모집',
      value: formatDateRange(recruitStartDate, recruitEndDate),
      caption: `${values.recruitEndTime ?? getDefaultTime('end')} 마감`,
    })
  }
  if (hasInterview && documentResultDate) {
    items.push({ label: '서류 결과 발표', value: formatMonthDayWithWeekday(documentResultDate) })
  }
  const [firstInterviewDate] = values.interviewDates
  const lastInterviewDate = values.interviewDates.at(-1)
  if (hasInterview && firstInterviewDate && lastInterviewDate) {
    items.push({ label: '면접', value: formatDateRange(firstInterviewDate, lastInterviewDate) })
  }
  if (finalResultDate) {
    items.push({ label: '최종 발표', value: formatMonthDayWithWeekday(finalResultDate) })
  }

  return items
}

// 안내 문구 형식 '10/1(수) 00:00'
function formatRecruitStart(date: string, time: string | null) {
  return `${formatMonthDayWithWeekday(date).replace(' (', '(')} ${time ?? getDefaultTime('start')}`
}

function getPreviewTags(values: PostingCreateValues, hasInterview: boolean) {
  return [
    hasInterview ? '면접 있음' : '면접 없음',
    ...(values.publicItems.includes('fee') ? [`회비 ${formatFee(values.fee)}`] : []),
    ...(values.publicItems.includes('region') && values.region.trim()
      ? [values.region.trim()]
      : []),
  ]
}

export {
  formatRecruitStart,
  getPostingInfoRows,
  getPreviewTags,
  getQualificationText,
  getScheduleItems,
}
export type { ReviewRow, ScheduleItem }
