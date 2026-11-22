import type { PostingQuestion } from '@/features/posting/types'
import type {
  ApplicationAnswerValues,
  FileAnswer,
} from '@/features/recruitment/schemas/applicationAnswerSchema'
import { getTextLength } from '@/utils/text'
import { toWebUrl } from '@/utils/url'

type FileAnswerRule = { acceptsFile: boolean; acceptsLink: boolean }

function isTextAnswerOverLimit(text: string, maxLength: number) {
  return getTextLength(text) > maxLength
}

// 올리지 못한 파일·잘못된 주소는 답변으로 세지 않음
function hasValidFileAnswer(
  { files, links }: FileAnswer,
  { acceptsFile, acceptsLink }: FileAnswerRule,
) {
  const hasValidFile = acceptsFile && files.some(({ rejection }) => rejection === null)
  const hasValidLink = acceptsLink && links.some(({ url }) => toWebUrl(url) !== null)

  return hasValidFile || hasValidLink
}

// 초과 입력은 허용하고 숫자만 강조해 스키마 오류 문구 없이 제출 버튼 비활성에만 사용(Figma 주석)
function hasOverLimitTextAnswer(
  questions: readonly PostingQuestion[],
  values: ApplicationAnswerValues,
) {
  return questions.some(
    (question) =>
      question.type === 'text' &&
      isTextAnswerOverLimit(values.texts[question.id] ?? '', question.maxLength),
  )
}

export { hasOverLimitTextAnswer, hasValidFileAnswer, isTextAnswerOverLimit }
