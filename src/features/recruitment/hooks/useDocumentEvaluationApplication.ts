import { z } from 'zod'
import {
  useDocEvaluationApplicationDetailQuery,
  usePostingQuestionsQuery,
} from '@/features/recruitment/api/organizer/queries'
import type {
  Activity,
  ActivityColumn,
} from '@/features/recruitment/components/organizer/documentEvaluationApplication/activityTable'
import type { QuestionHeaderContent } from '@/features/recruitment/components/organizer/documentEvaluationApplication/documentEvaluationApplication'
import type { FileLinkAttachment } from '@/features/recruitment/components/organizer/documentEvaluationApplication/fileLinkList'
import type { ScoreQuestion } from '@/features/recruitment/components/organizer/documentEvaluationPanel/scoreField'
import { parseActivityContent } from '@/features/recruitment/utils/applicationDraft'
import { DEFAULT_TEXT_MAX_LENGTH } from '@/features/recruitment/utils/applicationFormPosting'
import type {
  ActivityField,
  DocEvaluationApplicationDetailQuery,
  PostingQuestionsQuery,
} from '@/gql/graphql'
import { ApiError } from '@/lib/apiError'
import { formatDateTimeWithWeekday } from '@/utils/date'
import { formatPhoneNumber } from '@/utils/phone'

type ApplicationDetail = DocEvaluationApplicationDetailQuery['application']
type DetailAnswer = ApplicationDetail['answers'][number]
type DetailAttachment = DetailAnswer['attachments'][number]
type PostingQuestion = PostingQuestionsQuery['posting']['questions'][number]
type QuestionNumbers = ReadonlyMap<string, number>

type QuestionCard =
  | {
      type: 'text'
      id: string
      header: QuestionHeaderContent
      answer: string
      maxLength: number
    }
  | {
      type: 'activity'
      id: string
      header: QuestionHeaderContent
      columns: ActivityColumn[]
      activities: Activity[]
    }
  | {
      type: 'fileLink'
      id: string
      header: QuestionHeaderContent
      attachments: FileLinkAttachment[]
    }

const APPLICATION_NOT_FOUND_CODE = 'APPLICATION_404'

// 제출 시점 프로필(JSON), 학교는 미인증이면 null
const PROFILE_SNAPSHOT_SCHEMA = z.object({
  phone: z.string().nullish(),
  school: z.string().nullish(),
})

// 모양이 다르면 프로필 칸만 비우고 지원서는 그대로 표시
function toApplicantProfile(profileSnapshot: unknown) {
  const result = PROFILE_SNAPSHOT_SCHEMA.safeParse(profileSnapshot)
  const { phone, school } = result.success ? result.data : {}

  return {
    school: school ?? null,
    phone: phone ? formatPhoneNumber(phone) : null,
  }
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
function toAttachment({ id, type, url, fileName }: DetailAttachment): FileLinkAttachment {
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

function sortAnswers(answers: readonly DetailAnswer[]) {
  return [...answers].sort((a, b) => a.question.sortOrder - b.question.sortOrder)
}

// 지원서 작성 화면과 같은 번호, 공통·지원 포지션 문항 중 화면에 보이는 유형만 순서대로
function getQuestionNumbers(
  postingQuestions: readonly PostingQuestion[],
  positionId: string | null,
): QuestionNumbers {
  const numberedQuestions = [...postingQuestions]
    .filter(({ type }) => type === 'TEXT' || type === 'ACTIVITY' || type === 'FILE_LINK')
    .filter(({ position }) => position === null || position.id === positionId)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  return new Map(numberedQuestions.map(({ id }, index) => [id, index + 1]))
}

// 답한 문항만 카드, 비운 문항은 answers에 없어 번호를 건너뜀
function toQuestionCards(answers: readonly DetailAnswer[], questionNumbers: QuestionNumbers) {
  const questionCards: QuestionCard[] = []

  sortAnswers(answers).forEach(({ id, question, content, attachments: answerAttachments }) => {
    const number = questionNumbers.get(question.id)
    if (number === undefined) {
      return
    }

    const header = {
      number,
      title: question.title,
      required: question.required,
      description: question.description,
    }

    switch (question.type) {
      case 'TEXT':
        questionCards.push({
          type: 'text',
          id,
          header,
          answer: content ?? '',
          maxLength: question.maxLength ?? DEFAULT_TEXT_MAX_LENGTH,
        })
        return
      case 'ACTIVITY':
        questionCards.push({
          type: 'activity',
          id,
          header,
          columns: toActivityColumns(question.options?.activityFields),
          activities: parseActivityContent(content),
        })
        return
      case 'FILE_LINK':
        questionCards.push({
          type: 'fileLink',
          id,
          header,
          attachments: answerAttachments.map(toAttachment),
        })
        return
      // 공고 작성 명세에서 빠진 유형, 지원서 작성 화면도 미지원
      case 'SINGLE_CHOICE':
      case 'MULTI_CHOICE':
      case 'TABLE':
        return
    }
  })

  return questionCards
}

function toDocumentEvaluationApplication(
  application: ApplicationDetail,
  postingQuestions: readonly PostingQuestion[],
) {
  const questionNumbers = getQuestionNumbers(postingQuestions, application.position?.id ?? null)

  return {
    name: application.user.name,
    positionName: application.position?.name ?? null,
    ...toApplicantProfile(application.profileSnapshot),
    questionCards: toQuestionCards(application.answers, questionNumbers),
    // 문항별 점수는 카드가 있는 문항만, 번호도 카드와 같음
    scoreQuestions: sortAnswers(application.answers).flatMap(({ question }): ScoreQuestion[] => {
      const number = questionNumbers.get(question.id)
      return number === undefined ? [] : [{ id: question.id, number, label: question.title }]
    }),
    availableSlots: application.availableTimes.map((time) =>
      formatDateTimeWithWeekday(new Date(time)),
    ),
  }
}

// 지원서 영역과 평가 패널이 같은 조회 결과 사용, 문항 번호까지 매길 수 있을 때 함께 표시
function useDocumentEvaluationApplication(postingId: string, applicationId: string) {
  const detailQuery = useDocEvaluationApplicationDetailQuery(postingId, applicationId)
  const questionsQuery = usePostingQuestionsQuery(postingId)
  const isNotFound =
    detailQuery.error instanceof ApiError && detailQuery.error.code === APPLICATION_NOT_FOUND_CODE

  return {
    application:
      detailQuery.data &&
      questionsQuery.data &&
      toDocumentEvaluationApplication(detailQuery.data, questionsQuery.data),
    isError: detailQuery.isError || questionsQuery.isError,
    isNotFound,
  }
}

export { useDocumentEvaluationApplication }
