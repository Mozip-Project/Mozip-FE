import { describe, expect, it } from 'vitest'
import { resultNoticeMessageSchema } from './resultNoticeMessageSchema'

function getIssueMessages(values: { subject: string; body: string }) {
  const result = resultNoticeMessageSchema.safeParse(values)

  return result.success ? [] : result.error.issues.map(({ path, message }) => ({ path, message }))
}

describe('resultNoticeMessageSchema', () => {
  it('제목과 본문이 있으면 통과', () => {
    expect(
      getIssueMessages({ subject: '서류 전형 결과 안내', body: '{이름}님, 합격입니다.' }),
    ).toEqual([])
  })

  it('제목과 본문이 비면 각 위치에 Figma 오류 문구', () => {
    expect(getIssueMessages({ subject: '', body: '' })).toEqual([
      { path: ['subject'], message: '메일 제목을 입력해 주세요' },
      { path: ['body'], message: '본문을 입력해 주세요' },
    ])
  })

  it('공백만 입력해도 빈 값으로 처리', () => {
    expect(getIssueMessages({ subject: '   ', body: '\n\n' })).toEqual([
      { path: ['subject'], message: '메일 제목을 입력해 주세요' },
      { path: ['body'], message: '본문을 입력해 주세요' },
    ])
  })

  it('통과한 값은 공백을 지우지 않고 그대로 유지', () => {
    const result = resultNoticeMessageSchema.parse({ subject: ' 결과 안내 ', body: '본문\n' })

    expect(result).toEqual({ subject: ' 결과 안내 ', body: '본문\n' })
  })
})
