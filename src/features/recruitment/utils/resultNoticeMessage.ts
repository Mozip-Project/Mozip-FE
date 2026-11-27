import {
  RESULT_NOTICE_VARIABLES,
  type ResultNoticeVariable,
  type ResultNoticeVariableValues,
} from '@/features/recruitment/types'
import type { MessageVariable } from '@/gql/graphql'
import { formatMonthDayWithWeekday } from '@/utils/date'
import { isOneOf } from '@/utils/isOneOf'

const NOTICE_VARIABLE_LABEL = {
  NAME: '이름',
  POSITION: '포지션',
  INTERVIEW_PERIOD: '면접 기간',
  INTERVIEW_AT: '면접 일시',
  INTERVIEW_LOCATION: '면접 장소',
} satisfies Record<MessageVariable, ResultNoticeVariable>

const VARIABLE_PATTERN = /\{([^{}]+)\}/g

// 값이 없거나 정의되지 않은 변수는 `{변수}` 그대로 유지
function fillNoticeVariables(template: string, values: ResultNoticeVariableValues) {
  return template.replace(VARIABLE_PATTERN, (token, name: string) => {
    if (!isOneOf(RESULT_NOTICE_VARIABLES, name)) {
      return token
    }

    return values[name] ?? token
  })
}

// 서버 변수를 본문 변수 이름으로
function toNoticeVariables(variables: readonly MessageVariable[]) {
  return variables.map((variable) => NOTICE_VARIABLE_LABEL[variable])
}

// 면접 첫 날 ~ 마지막 날
function formatInterviewPeriod(ranges: readonly { date: string }[]) {
  const dates = ranges.map(({ date }) => date).sort()
  const [firstDate] = dates
  const lastDate = dates.at(-1)

  if (!firstDate || !lastDate) {
    return undefined
  }
  if (firstDate === lastDate) {
    return formatMonthDayWithWeekday(firstDate)
  }
  return `${formatMonthDayWithWeekday(firstDate)} ~ ${formatMonthDayWithWeekday(lastDate)}`
}

export { fillNoticeVariables, formatInterviewPeriod, toNoticeVariables }
