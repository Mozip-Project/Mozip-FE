import type { PostingCreateValues } from '@/features/posting/schemas/postingCreateValues'
import type {
  PostingQuestion as PostingFormQuestion,
  PostingQuestionSet,
} from '@/features/posting/schemas/postingFormSchema'
import type {
  PostingDetail,
  PostingQuestion,
  PostingQuestionPreview,
} from '@/features/posting/types'
import { parsePostingContentHtml } from '@/features/posting/utils/postingContent'
import {
  getEligibility,
  INTERVIEW_AVAILABILITY_QUESTION,
} from '@/features/posting/utils/postingDetail'
import { getPositionNames } from '@/features/posting/utils/postingPositions'
import { toSeoulDateTime } from '@/utils/date'
import { formatThousands } from '@/utils/number'
import { getDefaultTime } from '@/utils/time'

// 단체·대표 이미지는 작성 값에 없어 화면에서 따로 전달
type PostingPreviewDetail = Omit<PostingDetail, 'id' | 'organization' | 'coverImageUrl'>

type PreviewApplicationForm = {
  id: string
  // null은 포지션 없는 모집
  positionName: string | null
  questions: PostingQuestion[]
}

function getInterviewPeriod(interviewDates: readonly string[]) {
  const dates = interviewDates.toSorted()
  const startDate = dates[0]
  const endDate = dates.at(-1)

  return startDate && endDate ? { startDate, endDate } : null
}

function toPostingPreviewDetail(
  values: PostingCreateValues,
  hasInterview: boolean,
): PostingPreviewDetail {
  const { qualifications, publicItems, recruitStartDate, recruitEndDate } = values
  const interviewQuestions = hasInterview ? [INTERVIEW_AVAILABILITY_QUESTION] : []

  function getQuestionPreviews(questionSet: PostingQuestionSet | undefined) {
    const questions: PostingQuestionPreview[] = (questionSet?.questions ?? []).map(
      ({ id, title }) => ({ id, title }),
    )
    return [...questions, ...interviewQuestions]
  }

  return {
    title: values.title.trim(),
    hasInterview,
    interviewPeriod: hasInterview ? getInterviewPeriod(values.interviewDates) : null,
    eligibility: getEligibility({
      allowEnrolled: qualifications.includes('student'),
      allowOnLeave: qualifications.includes('leaveOfAbsence'),
      eligibilityNote: qualifications.includes('custom') ? values.customQualification : null,
    }),
    // 1단계에서 공개하기로 한 항목만 표시
    activityArea: publicItems.includes('region') ? values.region.trim() : null,
    membershipFee: publicItems.includes('fee') && values.fee ? formatThousands(values.fee) : null,
    recruitmentStartsAt:
      recruitStartDate &&
      toSeoulDateTime(recruitStartDate, values.recruitStartTime ?? getDefaultTime('start')),
    recruitmentEndsAt:
      recruitEndDate &&
      toSeoulDateTime(recruitEndDate, values.recruitEndTime ?? getDefaultTime('end')),
    // 면접 없는 모집은 최종 발표일 하나만 입력, 지원자 화면은 서류 결과일을 결과 발표로 표시
    documentResultDate: hasInterview ? values.documentResultDate : values.finalResultDate,
    finalResultDate: values.finalResultDate,
    content: parsePostingContentHtml(values.content),
    positions: getPositionNames(values).map((name, index) => ({
      id: String(index),
      name,
      questions: getQuestionPreviews(values.questionSets[index]),
    })),
    questions: getQuestionPreviews(values.questionSets[0]),
  }
}

function toApplicantQuestion(question: PostingFormQuestion): PostingQuestion {
  const base = {
    id: question.id,
    title: question.title,
    description: question.description.trim() || null,
    isRequired: question.isRequired,
  }

  switch (question.type) {
    case 'text':
      return { ...base, type: 'text', maxLength: Number(question.maxLength) }
    case 'activity':
      return {
        ...base,
        type: 'activity',
        activityFields: question.activityFields,
        maxActivityCount: question.maxActivityCount,
      }
    case 'file':
      return {
        ...base,
        type: 'file',
        acceptsFile: question.acceptsFile,
        acceptsLink: question.acceptsLink,
        fileTypes: question.fileTypes,
      }
  }
}

// 지원자가 포지션을 골랐을 때 보는 문항, 면접 있는 모집은 끝에 면접 가능 시간
function getPreviewApplicationForms(
  values: PostingCreateValues,
  hasInterview: boolean,
): PreviewApplicationForm[] {
  const positionNames = getPositionNames(values)
  const formNames = positionNames.length > 0 ? positionNames : [null]

  return formNames.map((positionName, index) => {
    const id = String(index)
    const questions = (values.questionSets[index]?.questions ?? []).map(toApplicantQuestion)

    if (!hasInterview) {
      return { id, positionName, questions }
    }

    // 지원서 작성 화면(applicationFormPosting)과 같은 문구
    const availabilityQuestion: PostingQuestion = {
      id: `${id}-interview-time`,
      type: 'availability',
      title: '면접 가능 시간 선택',
      description: '면접에 참석할 수 있는 시간을 모두 골라 주세요.',
      isRequired: true,
      interviewSlots: values.interviewSlots.toSorted(),
    }
    return { id, positionName, questions: [...questions, availabilityQuestion] }
  })
}

export { getPreviewApplicationForms, toPostingPreviewDetail }
export type { PostingPreviewDetail, PreviewApplicationForm }
