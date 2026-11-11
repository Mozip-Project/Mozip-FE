import {
  RESULT_NOTICE_VARIABLES,
  type ResultNoticeVariableValues,
} from '@/features/recruitment/types'
import { isOneOf } from '@/utils/isOneOf'

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

export { fillNoticeVariables }
