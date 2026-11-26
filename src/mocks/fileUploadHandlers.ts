import { delay, http, HttpResponse } from 'msw'
import { FILE_UPLOAD_PURPOSES, type FileUploadPurpose } from '@/lib/fileUpload'
import { MOCK_RESPONSE_DELAY_MS } from './responseDelay'

// 실제 저장소 대신 MSW가 받는 업로드 주소
const MOCK_STORAGE_ORIGIN = 'https://upload.mock.mozip.test'
const MB = 1024 * 1024

const IMAGE_TYPES = ['image/png', 'image/jpeg']
const PDF_TYPE = 'application/pdf'
const PPT_TYPES = [
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]

type UploadLimit = {
  acceptedTypes: readonly string[]
  maxSizeBytes: number
}

// 백엔드가 알려 준 용도별 제한
// TODO: 지원서 첨부는 백엔드 답변이 없어 공고 파일 질문에서 고를 수 있는 형식 전체로 가정
const UPLOAD_LIMIT_BY_PURPOSE = {
  ORG_LOGO: {
    acceptedTypes: [...IMAGE_TYPES, 'image/webp', 'image/svg+xml'],
    maxSizeBytes: 5 * MB,
  },
  POSTING_IMAGE: { acceptedTypes: [...IMAGE_TYPES, 'image/webp'], maxSizeBytes: 10 * MB },
  ENROLLMENT_CERT: { acceptedTypes: [...IMAGE_TYPES, PDF_TYPE], maxSizeBytes: 10 * MB },
  // 백엔드 미정, 정보 수정 화면의 사진 선택 기준(PNG·JPG, 10MB)으로 가정
  PROFILE_IMAGE: { acceptedTypes: IMAGE_TYPES, maxSizeBytes: 10 * MB },
  APPLICATION_ATTACHMENT: {
    acceptedTypes: [PDF_TYPE, ...IMAGE_TYPES, ...PPT_TYPES, 'video/mp4'],
    maxSizeBytes: 10 * MB,
  },
} satisfies Record<FileUploadPurpose, UploadLimit>

type PresignedUrlRequest = {
  purpose: FileUploadPurpose
  fileName: string
  contentType: string
  size: number
}

// 업로드한 파일을 새로고침 전까지 보관해 같은 주소로 다시 보여 줌
const uploadedFiles = new Map<string, Blob>()
let uploadSequence = 0

function resetUploadedFiles() {
  uploadedFiles.clear()
  uploadSequence = 0
}

function getUploadedFileUrl(fileKey: string) {
  return `${MOCK_STORAGE_ORIGIN}/${fileKey}`
}

function restError(status: number, code: string, message: string) {
  return HttpResponse.json({ success: false, code, message, data: null }, { status })
}

// 받은 용도만 MSW가 응답, 나머지는 응답하지 않아 실제 서버로 감
function createFileUploadHandlers(mockedPurposes: readonly FileUploadPurpose[]) {
  return [
    http.post<never, PresignedUrlRequest>('*/api/files/presigned-url', async ({ request }) => {
      // 실제 서버로 넘길 때 본문이 남아 있도록 복사본에서 읽음
      const { purpose, fileName, contentType, size } = await request.clone().json()
      if (!mockedPurposes.includes(purpose)) {
        return undefined
      }
      await delay(MOCK_RESPONSE_DELAY_MS)
      const { acceptedTypes, maxSizeBytes } = UPLOAD_LIMIT_BY_PURPOSE[purpose]

      if (size > maxSizeBytes) {
        return restError(413, 'FILE_413', '허용 용량을 초과했어요.')
      }
      if (!acceptedTypes.includes(contentType)) {
        return restError(415, 'FILE_415', '허용하지 않는 파일 형식이에요.')
      }

      uploadSequence += 1
      const extension = fileName.split('.').pop() ?? 'bin'
      const fileKey = `${purpose.toLowerCase()}/mock-${uploadSequence}.${extension}`
      const fileUrl = getUploadedFileUrl(fileKey)

      return HttpResponse.json({
        success: true,
        code: 'OK',
        message: '요청이 성공했습니다.',
        data: { uploadUrl: fileUrl, fileKey, fileUrl },
      })
    }),

    http.put(`${MOCK_STORAGE_ORIGIN}/*`, async ({ request }) => {
      uploadedFiles.set(new URL(request.url).pathname.slice(1), await request.blob())
      return new HttpResponse(null, { status: 200 })
    }),

    http.get(`${MOCK_STORAGE_ORIGIN}/*`, ({ request }) => {
      const file = uploadedFiles.get(new URL(request.url).pathname.slice(1))

      if (!file) {
        return new HttpResponse(null, { status: 404 })
      }
      return new HttpResponse(file, { headers: { 'Content-Type': file.type } })
    }),
  ]
}

const fileUploadHandlers = createFileUploadHandlers(FILE_UPLOAD_PURPOSES)
// 시연 모드용, 서버에 아직 없는 프로필 사진 용도만 MSW가 받음 (전시회 후 삭제)
const profileImageUploadHandlers = createFileUploadHandlers(['PROFILE_IMAGE'])

export { fileUploadHandlers, getUploadedFileUrl, profileImageUploadHandlers, resetUploadedFiles }
