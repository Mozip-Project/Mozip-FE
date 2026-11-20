import {
  ACTIVITY_FIELDS,
  type PostingQuestion,
  type PostingQuestionSet,
  type PostingQuestionType,
} from '@/features/posting/schemas/postingFormSchema'

const DEFAULT_MAX_LENGTH = '500'
const DEFAULT_MAX_ACTIVITY_COUNT = 3

const DEFAULT_QUESTION_TITLES = [
  '자기소개를 해 주세요',
  '지원 동기를 작성해 주세요',
  '지원 분야와 관련된 경험을 알려 주세요',
]

function createQuestion(type: PostingQuestionType, title = ''): PostingQuestion {
  return {
    id: crypto.randomUUID(),
    type,
    title,
    description: '',
    maxLength: DEFAULT_MAX_LENGTH,
    isRequired: true,
    acceptsFile: true,
    acceptsLink: true,
    fileTypes: [],
    activityFields: [...ACTIVITY_FIELDS],
    maxActivityCount: DEFAULT_MAX_ACTIVITY_COUNT,
  }
}

function createDefaultQuestionSet() {
  return { questions: DEFAULT_QUESTION_TITLES.map((title) => createQuestion('text', title)) }
}

// 작성한 문항은 유지하고 포지션 수 변화만 반영
function resizeQuestionSets(questionSets: PostingQuestionSet[], setCount: number) {
  return Array.from(
    { length: setCount },
    (_, index) => questionSets[index] ?? createDefaultQuestionSet(),
  )
}

export { createQuestion, DEFAULT_QUESTION_TITLES, resizeQuestionSets }
