import ClipIcon from '@/assets/icons/clip.svg'
import RowsIcon from '@/assets/icons/rows.svg'
import TextLongIcon from '@/assets/icons/textLong.svg'
import type {
  PostingActivityField,
  PostingFileType,
  PostingQuestionType,
} from '@/features/posting/schemas/postingFormSchema'
import type { ComponentType, SVGProps } from 'react'

type QuestionTypeMeta = {
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

const QUESTION_TYPE_META = {
  text: { label: '장문형', Icon: TextLongIcon },
  activity: { label: '활동 경험', Icon: RowsIcon },
  file: { label: '파일 또는 URL', Icon: ClipIcon },
} satisfies Record<PostingQuestionType, QuestionTypeMeta>

const FILE_TYPE_LABEL = {
  pdf: 'PDF',
  image: '이미지',
  ppt: 'PPT',
  mp4: 'MP4',
} satisfies Record<PostingFileType, string>

const ACTIVITY_FIELD_LABEL = {
  period: '활동 기간',
  role: '역할',
  achievement: '주요 성과',
} satisfies Record<PostingActivityField, string>

export { ACTIVITY_FIELD_LABEL, FILE_TYPE_LABEL, QUESTION_TYPE_META }
