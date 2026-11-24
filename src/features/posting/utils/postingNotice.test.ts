import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/apiError'
import { getNoticeSendErrorMessage } from './postingNotice'

describe('getNoticeSendErrorMessage', () => {
  it('받는 사람이 없으면 지원자 없음 안내', () => {
    expect(getNoticeSendErrorMessage(new ApiError({ code: 'MESSAGE_422', message: '' }))).toBe(
      '공지를 받을 수 있는 지원자가 없어요',
    )
  })

  it('명세에 없는 코드와 네트워크 오류는 다시 시도 안내', () => {
    const retryMessage = '공지를 보내지 못했어요. 잠시 후 다시 시도해 주세요'

    expect(getNoticeSendErrorMessage(new ApiError({ code: 'COMMON_500', message: '' }))).toBe(
      retryMessage,
    )
    expect(getNoticeSendErrorMessage(new Error('Failed to fetch'))).toBe(retryMessage)
  })
})
