import type { PostingQuestion } from '@/features/posting/schemas/postingFormSchema'
import { createQuestion } from './postingQuestions'

const QUESTION_TEMPLATE_IDS = ['teamwork', 'commitment', 'portfolio'] as const

type QuestionTemplateId = (typeof QUESTION_TEMPLATE_IDS)[number]

const QUESTION_TEMPLATE_LABEL = {
  teamwork: '팀워크형',
  commitment: '활동 의지형',
  portfolio: '포트폴리오형',
} satisfies Record<QuestionTemplateId, string>

function createTextQuestion(title: string, maxLength: string) {
  return { ...createQuestion('text', title), maxLength }
}

function createTemplateQuestions(templateId: QuestionTemplateId): PostingQuestion[] {
  switch (templateId) {
    case 'teamwork':
      return [
        createTextQuestion('팀 활동에서 협업한 경험과 내 역할을 알려 주세요.', '700'),
        createTextQuestion('활동 중 문제를 해결한 경험을 알려 주세요.', '700'),
        createTextQuestion('팀원과 갈등을 해결한 경험을 알려 주세요.', '700'),
      ]
    case 'commitment':
      return [
        createTextQuestion('활동 기간 동안 이루고 싶은 목표를 작성해 주세요.', '700'),
        createTextQuestion(
          '활동에 투입할 수 있는 시간과 다른 일정과의 병행 계획을 알려 주세요.',
          '700',
        ),
        createTextQuestion('이 활동으로 얻고 싶은 것은 무엇인가요?', '700'),
      ]
    case 'portfolio':
      return [
        {
          ...createQuestion('file', '포트폴리오 또는 결과물을 첨부해 주세요.'),
          fileTypes: ['pdf', 'image'],
        },
        createTextQuestion('대표 결과물에 대해 설명해 주세요. (기획 의도, 내 역할 등)', '700'),
        createTextQuestion('작업에 사용한 도구나 기술을 알려 주세요.', '300'),
      ]
  }
}

export { createTemplateQuestions, QUESTION_TEMPLATE_IDS, QUESTION_TEMPLATE_LABEL }
export type { QuestionTemplateId }
