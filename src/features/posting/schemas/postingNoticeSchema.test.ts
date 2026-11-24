import { describe, expect, it } from 'vitest'
import { POSTING_NOTICE_SUBJECT_MAX_LENGTH, postingNoticeSchema } from './postingNoticeSchema'

function getIssueMessages(values: { subject: string; body: string }) {
  const result = postingNoticeSchema.safeParse(values)

  return result.success ? [] : result.error.issues.map(({ path, message }) => ({ path, message }))
}

describe('postingNoticeSchema', () => {
  it('제목이 100자면 통과', () => {
    expect(
      getIssueMessages({
        subject: 'a'.repeat(POSTING_NOTICE_SUBJECT_MAX_LENGTH),
        body: '{이름}님, 일정이 바뀌었어요.',
      }),
    ).toEqual([])
  })

  it('제목이 100자를 넘으면 제목 오류', () => {
    expect(
      getIssueMessages({
        subject: 'a'.repeat(POSTING_NOTICE_SUBJECT_MAX_LENGTH + 1),
        body: '본문',
      }),
    ).toEqual([{ path: ['subject'], message: '메일 제목은 100자 이내로 입력해 주세요' }])
  })

  it('제목과 본문이 비면 결과 안내와 같은 문구', () => {
    expect(getIssueMessages({ subject: ' ', body: '' })).toEqual([
      { path: ['subject'], message: '메일 제목을 입력해 주세요' },
      { path: ['body'], message: '본문을 입력해 주세요' },
    ])
  })
})
