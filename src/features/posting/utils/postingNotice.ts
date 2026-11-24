import { ApiError } from '@/lib/apiError'

const NOTICE_SEND_ERROR_MESSAGE: Record<string, string> = {
  MESSAGE_422: '공지를 받을 수 있는 지원자가 없어요',
  MESSAGE_409: '게시 전 공고에는 공지를 보낼 수 없어요',
  POSTING_404: '공고를 찾을 수 없어요',
  COMMON_403: '이 공고에 공지를 보낼 권한이 없어요',
}

const DEFAULT_NOTICE_SEND_ERROR_MESSAGE = '공지를 보내지 못했어요. 잠시 후 다시 시도해 주세요'

// TODO: 공지 발송 실패 안내 디자인 확인 필요, 문구는 명세의 에러 상황 기준
function getNoticeSendErrorMessage(error: Error) {
  if (error instanceof ApiError) {
    return NOTICE_SEND_ERROR_MESSAGE[error.code] ?? DEFAULT_NOTICE_SEND_ERROR_MESSAGE
  }
  return DEFAULT_NOTICE_SEND_ERROR_MESSAGE
}

export { getNoticeSendErrorMessage }
