import { describe, expect, it } from 'vitest'
import { getPostingCreateSteps } from './postingCreateSteps'
import { getFirstPublishErrorStepId } from './postingPublishError'

const INTERVIEW_STEP_IDS = getPostingCreateSteps(true).map(({ id }) => id)
const NO_INTERVIEW_STEP_IDS = getPostingCreateSteps(false).map(({ id }) => id)

function fieldError(field: string) {
  return { field, message: '확인해 주세요' }
}

describe('getFirstPublishErrorStepId', () => {
  it('서버 단계를 화면 단계로 바꾸고 화면 순서상 가장 앞 단계', () => {
    expect(
      getFirstPublishErrorStepId(
        [fieldError('questionsStep'), fieldError('positionsStep')],
        INTERVIEW_STEP_IDS,
      ),
    ).toBe('method')
    expect(getFirstPublishErrorStepId([fieldError('basicStep')], INTERVIEW_STEP_IDS)).toBe('info')
  })

  it('면접 단계가 없는 공고의 면접 오류나 알 수 없는 값은 null', () => {
    expect(getFirstPublishErrorStepId([fieldError('interviewStep')], NO_INTERVIEW_STEP_IDS)).toBe(
      null,
    )
    expect(getFirstPublishErrorStepId([fieldError('unknown')], INTERVIEW_STEP_IDS)).toBe(null)
    expect(getFirstPublishErrorStepId([], INTERVIEW_STEP_IDS)).toBe(null)
  })
})
