import type { ActivityColumn } from '@/features/recruitment/components/applicationAnswerCards/activityTable'
import type { QuestionCard } from '@/features/recruitment/components/applicationAnswerCards/applicationAnswerCards'
import type { FileLinkAttachment } from '@/features/recruitment/components/applicationAnswerCards/fileLinkList'
import { parseActivityContent } from '@/features/recruitment/utils/applicationDraft'
import { DEFAULT_TEXT_MAX_LENGTH } from '@/features/recruitment/utils/applicationFormPosting'
import type { ActivityField, AttachmentType, QuestionType } from '@/gql/graphql'

type AnswerAttachment = {
  id: string
  type: AttachmentType
  url: string
  fileName?: string | null
}

type CardQuestion = {
  type: QuestionType
  title: string
  description?: string | null
  required: boolean
  maxLength?: number | null
  options?: { activityFields?: readonly ActivityField[] | null } | null
}

// 비운 문항은 답변 없이 전달
type CardAnswer = {
  content?: string | null
  attachments: readonly AnswerAttachment[]
}

type QuestionCardSource = {
  id: string
  number: number
  question: CardQuestion
  answer: CardAnswer | undefined
}

// 문항에서 켠 항목만 열로, 순서는 표 기준
const ACTIVITY_COLUMN_ORDER: readonly ActivityField[] = ['NAME', 'PERIOD', 'ROLE', 'ACHIEVEMENT']

const ACTIVITY_COLUMN = {
  NAME: 'name',
  PERIOD: 'period',
  ROLE: 'role',
  ACHIEVEMENT: 'achievement',
} satisfies Record<ActivityField, ActivityColumn>

// TODO: 파일 크기는 응답에 없어 확장자만 표시
function toAttachment({ id, type, url, fileName }: AnswerAttachment): FileLinkAttachment {
  switch (type) {
    case 'FILE': {
      const extension = fileName?.includes('.') ? fileName.split('.').at(-1) : undefined
      return {
        id,
        type: 'file',
        name: fileName ?? '첨부 파일',
        meta: extension?.toUpperCase() ?? '파일',
        href: url,
      }
    }
    case 'LINK':
      return {
        id,
        type: 'link',
        name: url.replace(/^https?:\/\//, ''),
        meta: '외부 링크',
        href: url,
      }
  }
}

// 설정이 없으면 모든 항목
function toActivityColumns(activityFields: readonly ActivityField[] | null | undefined) {
  return ACTIVITY_COLUMN_ORDER.filter(
    (field) => !activityFields || activityFields.includes(field),
  ).map((field) => ACTIVITY_COLUMN[field])
}

// 화면에 없는 문항 유형은 null
function toQuestionCard({ id, number, question, answer }: QuestionCardSource): QuestionCard | null {
  const header = {
    number,
    title: question.title,
    required: question.required,
    description: question.description ?? null,
  }

  switch (question.type) {
    case 'TEXT':
      return {
        type: 'text',
        id,
        header,
        answer: answer?.content ?? '',
        maxLength: question.maxLength ?? DEFAULT_TEXT_MAX_LENGTH,
      }
    case 'ACTIVITY':
      return {
        type: 'activity',
        id,
        header,
        columns: toActivityColumns(question.options?.activityFields),
        activities: parseActivityContent(answer?.content ?? null),
      }
    case 'FILE_LINK':
      return {
        type: 'fileLink',
        id,
        header,
        attachments: (answer?.attachments ?? []).map(toAttachment),
      }
    // 공고 작성 명세에서 빠진 유형, 지원서 작성 화면도 미지원
    case 'SINGLE_CHOICE':
    case 'MULTI_CHOICE':
    case 'TABLE':
      return null
  }
}

export { toQuestionCard }
