import { z } from 'zod'
import type { PostingQuestion } from '@/features/posting/types'
import { hasValidFileAnswer } from '@/features/recruitment/utils/applicationAnswer'
import type { FileRejection } from '@/utils/file'

type ActivityAnswer = {
  id: string
  name: string
  period: string
  role: string
  achievement: string
}

type ActivityInputName = Exclude<keyof ActivityAnswer, 'id'>

type FileAnswerFile = {
  id: string
  file: File
  // 형식·크기 규칙에 맞지 않아 올리지 못한 파일, 삭제 전까지 오류 줄로 표시
  rejection: FileRejection | null
}

type FileAnswerLink = {
  id: string
  // 지원자가 입력한 그대로, 주소 확인은 toWebUrl
  url: string
}

type FileAnswer = {
  files: FileAnswerFile[]
  links: FileAnswerLink[]
}

// 문항 유형마다 값 모양이 달라 유형별로 나눠 문항 id로 보관
type ApplicationAnswerValues = {
  texts: Record<string, string>
  activities: Record<string, ActivityAnswer[]>
  files: Record<string, FileAnswer>
  // 고른 면접 칸 시작 시각('YYYY-MM-DDTHH:mm')
  availabilities: Record<string, string[]>
}

function createEmptyActivityAnswer(): ActivityAnswer {
  return { id: crypto.randomUUID(), name: '', period: '', role: '', achievement: '' }
}

function createEmptyApplicationAnswers(
  questions: readonly PostingQuestion[],
): ApplicationAnswerValues {
  const values: ApplicationAnswerValues = {
    texts: {},
    activities: {},
    files: {},
    availabilities: {},
  }

  for (const question of questions) {
    switch (question.type) {
      case 'text':
        values.texts[question.id] = ''
        break
      case 'activity':
        // 활동 경험은 최소 한 건이라 빈 항목 하나로 시작
        values.activities[question.id] = [createEmptyActivityAnswer()]
        break
      case 'file':
        values.files[question.id] = { files: [], links: [] }
        break
      case 'availability':
        values.availabilities[question.id] = []
        break
    }
  }

  return values
}

// Figma 지원서 2단계 에러 화면 문구, 장문형 빈칸은 Figma에 없어 입력창 안내 문구 사용
const TEXT_REQUIRED_MESSAGE = '답변을 입력해 주세요'
const FILE_REQUIRED_MESSAGE = '파일이나 링크를 1개 이상 올려 주세요'
const AVAILABILITY_REQUIRED_MESSAGE = '면접 가능 시간을 최소 1개 선택해 주세요'

const ACTIVITY_REQUIRED_MESSAGE = {
  name: '활동명을 입력해 주세요.',
  period: '활동 기간을 입력해 주세요.',
  role: '역할을 입력해 주세요.',
  achievement: '주요 성과를 입력해 주세요.',
} satisfies Record<ActivityInputName, string>

function createApplicationAnswerSchema(questions: readonly PostingQuestion[]) {
  return z.custom<ApplicationAnswerValues>().superRefine((values, context) => {
    for (const question of questions) {
      if (!question.isRequired) {
        continue
      }

      switch (question.type) {
        case 'text':
          if (!values.texts[question.id]?.trim()) {
            context.addIssue({
              code: 'custom',
              path: ['texts', question.id],
              message: TEXT_REQUIRED_MESSAGE,
            })
          }
          break
        case 'activity': {
          const inputNames: ActivityInputName[] = ['name', ...question.activityFields]
          const activities = values.activities[question.id] ?? []

          activities.forEach((activity, index) => {
            for (const name of inputNames) {
              if (!activity[name].trim()) {
                context.addIssue({
                  code: 'custom',
                  path: ['activities', question.id, index, name],
                  message: ACTIVITY_REQUIRED_MESSAGE[name],
                })
              }
            }
          })
          break
        }
        case 'file': {
          const answer = values.files[question.id] ?? { files: [], links: [] }

          if (!hasValidFileAnswer(answer, question)) {
            context.addIssue({
              code: 'custom',
              path: ['files', question.id],
              message: FILE_REQUIRED_MESSAGE,
            })
          }
          break
        }
        case 'availability':
          if ((values.availabilities[question.id] ?? []).length === 0) {
            context.addIssue({
              code: 'custom',
              path: ['availabilities', question.id],
              message: AVAILABILITY_REQUIRED_MESSAGE,
            })
          }
          break
      }
    }
  })
}

export { createApplicationAnswerSchema, createEmptyActivityAnswer, createEmptyApplicationAnswers }
export type {
  ActivityAnswer,
  ActivityInputName,
  ApplicationAnswerValues,
  FileAnswer,
  FileAnswerFile,
  FileAnswerLink,
}
