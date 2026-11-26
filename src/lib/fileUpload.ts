import { requestRest } from './restClient'

const PRESIGNED_URL_PATH = '/api/files/presigned-url'

// 용도마다 서버의 허용 형식·용량이 다름
const FILE_UPLOAD_PURPOSES = [
  'ORG_LOGO',
  'POSTING_IMAGE',
  'ENROLLMENT_CERT',
  'APPLICATION_ATTACHMENT',
  // TODO: 백엔드에 프로필 사진 용도 추가 요청 중, 이름·형식·용량 확정되면 맞춤
  'PROFILE_IMAGE',
] as const

type FileUploadPurpose = (typeof FILE_UPLOAD_PURPOSES)[number]

type UploadedFile = {
  // GraphQL mutation에 넘기는 키
  fileKey: string
  // 업로드 후 이미지 등을 보여 줄 주소
  fileUrl: string
}

type PresignedUpload = UploadedFile & {
  uploadUrl: string
}

// 업로드 단계의 실패를 이어지는 저장 실패와 구분, 원인은 cause에 보관
class FileUploadError extends Error {
  constructor(cause: unknown) {
    super('파일을 업로드하지 못했습니다.', { cause })
    this.name = 'FileUploadError'
  }
}

function readString(source: unknown, key: string) {
  if (typeof source !== 'object' || source === null) {
    return undefined
  }
  const value: unknown = Reflect.get(source, key)
  return typeof value === 'string' ? value : undefined
}

function toPresignedUpload(data: unknown): PresignedUpload {
  const uploadUrl = readString(data, 'uploadUrl')
  const fileKey = readString(data, 'fileKey')
  const fileUrl = readString(data, 'fileUrl')

  if (!uploadUrl || !fileKey || !fileUrl) {
    throw new Error('업로드 주소 응답 형식이 올바르지 않습니다.')
  }
  return { uploadUrl, fileKey, fileUrl }
}

// 서버를 거치지 않고 발급받은 주소로 파일을 직접 올린 뒤 fileKey 반환, 실패는 FileUploadError
async function uploadFile(file: File, purpose: FileUploadPurpose): Promise<UploadedFile> {
  try {
    return await sendFile(file, purpose)
  } catch (error) {
    throw new FileUploadError(error)
  }
}

async function sendFile(file: File, purpose: FileUploadPurpose): Promise<UploadedFile> {
  const { uploadUrl, fileKey, fileUrl } = toPresignedUpload(
    await requestRest(PRESIGNED_URL_PATH, {
      method: 'POST',
      body: { purpose, fileName: file.name, contentType: file.type, size: file.size },
    }),
  )

  // 저장소 주소라 로그인 쿠키를 보내지 않음
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })
  if (!response.ok) {
    throw new Error(`파일 업로드 실패 (HTTP ${response.status})`)
  }
  return { fileKey, fileUrl }
}

export { FILE_UPLOAD_PURPOSES, FileUploadError, uploadFile }
export type { FileUploadPurpose, UploadedFile }
