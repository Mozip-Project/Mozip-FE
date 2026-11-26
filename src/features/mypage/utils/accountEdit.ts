import type { AccountEditValues } from '@/features/mypage/schemas/accountEditSchema'
import type { ChangePasswordInput, UpdateProfileInput } from '@/gql/graphql'
import { ApiError } from '@/lib/apiError'
import { toPhoneDigits } from '@/utils/phone'

const REQUEST_FAILED_MESSAGE = '잠시 후 다시 시도해 주세요.'

type ProfileChangeContext = {
  savedName: string
  /** 인증을 마친 새 번호(화면 형식), 없으면 null */
  verifiedPhone: string | null
  /** 새로 고른 프로필 이미지를 올리고 받은 주소, 없으면 기존 이미지 유지 */
  uploadedImageUrl?: string
}

// TODO: 휴대폰 인증·저장 오류 안내 문구 디자인 확인 필요, 지금은 서버 메시지 표시
function getServerErrorMessage(error: Error) {
  return error instanceof ApiError ? error.message : REQUEST_FAILED_MESSAGE
}

// 비밀번호 칸을 비워 두면 변경하지 않음, 입력 규칙은 폼 검증이 먼저 확인
function toChangePasswordInput({
  currentPassword,
  newPassword,
}: AccountEditValues): ChangePasswordInput | null {
  if (!currentPassword && !newPassword) {
    return null
  }
  return { currentPassword, newPassword }
}

// 바뀐 이름·인증한 번호·새 프로필 이미지만 보내고, 모두 그대로면 요청하지 않음
function toUpdateProfileInput(
  { name, newPhone }: AccountEditValues,
  { savedName, verifiedPhone, uploadedImageUrl }: ProfileChangeContext,
): UpdateProfileInput | null {
  const trimmedName = name.trim()
  const isNameChanged = trimmedName !== savedName
  const isPhoneChanged = newPhone !== '' && newPhone === verifiedPhone

  if (!isNameChanged && !isPhoneChanged && !uploadedImageUrl) {
    return null
  }
  return {
    ...(isNameChanged ? { name: trimmedName } : {}),
    ...(isPhoneChanged ? { phone: toPhoneDigits(newPhone) } : {}),
    ...(uploadedImageUrl ? { profileImageUrl: uploadedImageUrl } : {}),
  }
}

export { getServerErrorMessage, toChangePasswordInput, toUpdateProfileInput }
