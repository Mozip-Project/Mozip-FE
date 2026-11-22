import { describe, expect, it } from 'vitest'
import type { PostingQuestion } from '@/features/posting/types'
import {
  createApplicationAnswerSchema,
  createEmptyApplicationAnswers,
  type ApplicationAnswerValues,
} from './applicationAnswerSchema'

const BASE = { title: '문항', description: null, isRequired: true }

const TEXT_QUESTION = {
  ...BASE,
  id: 'motivation',
  type: 'text',
  maxLength: 500,
} satisfies PostingQuestion

const QUESTIONS = [
  TEXT_QUESTION,
  {
    ...BASE,
    id: 'experience',
    type: 'activity',
    activityFields: ['period'],
    maxActivityCount: 3,
  },
  {
    ...BASE,
    id: 'portfolio',
    type: 'file',
    acceptsFile: true,
    acceptsLink: true,
    fileTypes: ['pdf'],
  },
  { ...BASE, id: 'interview-time', type: 'availability', interviewSlots: ['2026-10-21T13:00'] },
] satisfies PostingQuestion[]

describe('createEmptyApplicationAnswers', () => {
  it('문항 유형별로 빈 답변을 문항 id에 담음', () => {
    const answers = createEmptyApplicationAnswers(QUESTIONS)

    expect(answers.texts).toEqual({ motivation: '' })
    expect(answers.files).toEqual({ portfolio: { files: [], links: [] } })
    expect(answers.availabilities).toEqual({ 'interview-time': [] })
  })

  it('활동 경험은 빈 항목 하나로 시작', () => {
    const answers = createEmptyApplicationAnswers(QUESTIONS)

    const [activity, ...rest] = answers.activities.experience ?? []

    expect(rest).toHaveLength(0)
    expect(activity).toMatchObject({ name: '', period: '', role: '', achievement: '' })
    expect(activity?.id).toBeTruthy()
  })
})

describe('createApplicationAnswerSchema', () => {
  function getIssues(questions: readonly PostingQuestion[], values: ApplicationAnswerValues) {
    const result = createApplicationAnswerSchema(questions).safeParse(values)

    return result.success ? [] : result.error.issues.map(({ path, message }) => ({ path, message }))
  }

  it('필수 문항이 비어 있으면 유형별 오류', () => {
    const issues = getIssues(QUESTIONS, createEmptyApplicationAnswers(QUESTIONS))

    expect(issues).toEqual([
      { path: ['texts', 'motivation'], message: '답변을 입력해 주세요' },
      { path: ['activities', 'experience', 0, 'name'], message: '활동명을 입력해 주세요.' },
      { path: ['activities', 'experience', 0, 'period'], message: '활동 기간을 입력해 주세요.' },
      { path: ['files', 'portfolio'], message: '파일이나 링크를 1개 이상 올려 주세요' },
      {
        path: ['availabilities', 'interview-time'],
        message: '면접 가능 시간을 최소 1개 선택해 주세요',
      },
    ])
  })

  it('필수가 아닌 문항은 비어 있어도 통과', () => {
    const optionalQuestions = QUESTIONS.map((question) => ({ ...question, isRequired: false }))

    expect(getIssues(optionalQuestions, createEmptyApplicationAnswers(optionalQuestions))).toEqual(
      [],
    )
  })

  it('공백만 입력한 장문형은 빈칸으로 봄', () => {
    const values = createEmptyApplicationAnswers(QUESTIONS)
    values.texts.motivation = '   '

    expect(getIssues([TEXT_QUESTION], values)).toEqual([
      { path: ['texts', 'motivation'], message: '답변을 입력해 주세요' },
    ])
  })

  it('넘겨받은 문항만 검사', () => {
    const values = createEmptyApplicationAnswers(QUESTIONS)
    values.texts.motivation = '지원 동기'

    expect(getIssues([TEXT_QUESTION], values)).toEqual([])
  })
})
