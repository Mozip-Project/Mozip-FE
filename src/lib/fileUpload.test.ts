import { http, HttpResponse } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { profileImageUploadHandlers, resetUploadedFiles } from '@/mocks/fileUploadHandlers'
import { server } from '@/mocks/server'
import { ApiError } from './apiError'
import { FileUploadError, uploadFile } from './fileUpload'

// MSW가 가로채는 테스트 전용 주소, REST는 GraphQL 주소와 같은 origin 사용
const GRAPHQL_ENDPOINT = 'https://api.test/graphql'
const PRESIGNED_URL = 'https://api.test/api/files/presigned-url'
const UPLOAD_URL = 'https://storage.test/logo.png'

function createFile(name: string, type: string, sizeBytes = 1024) {
  const file = new File(['image'], name, { type })
  Object.defineProperty(file, 'size', { value: sizeBytes })
  return file
}

function presignedSuccess(data: unknown) {
  return HttpResponse.json({ success: true, code: 'OK', message: '요청이 성공했습니다.', data })
}

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', GRAPHQL_ENDPOINT)
})

afterEach(() => {
  resetUploadedFiles()
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('uploadFile', () => {
  it('업로드 주소를 받아 파일을 올리고 fileKey·fileUrl 반환', async () => {
    let presignedBody: unknown
    let uploaded: { contentType: string | null; body: string } | undefined
    server.use(
      http.post(PRESIGNED_URL, async ({ request }) => {
        presignedBody = await request.json()
        return presignedSuccess({
          uploadUrl: UPLOAD_URL,
          fileKey: 'org_logo/1.png',
          fileUrl: 'https://cdn.test/org_logo/1.png',
        })
      }),
      http.put(UPLOAD_URL, async ({ request }) => {
        uploaded = { contentType: request.headers.get('Content-Type'), body: await request.text() }
        return new HttpResponse(null, { status: 200 })
      }),
    )

    const result = await uploadFile(createFile('logo.png', 'image/png', 2048), 'ORG_LOGO')

    expect(presignedBody).toEqual({
      purpose: 'ORG_LOGO',
      fileName: 'logo.png',
      contentType: 'image/png',
      size: 2048,
    })
    expect(uploaded).toEqual({ contentType: 'image/png', body: 'image' })
    expect(result).toEqual({
      fileKey: 'org_logo/1.png',
      fileUrl: 'https://cdn.test/org_logo/1.png',
    })
  })

  it('주소 발급이 거절되면 서버 코드를 원인으로 담은 업로드 에러', async () => {
    const error: unknown = await uploadFile(createFile('logo.gif', 'image/gif'), 'ORG_LOGO').catch(
      (caught: unknown) => caught,
    )

    expect(error).toBeInstanceOf(FileUploadError)
    expect(error).toHaveProperty('cause', expect.any(ApiError))
    expect(error).toHaveProperty('cause.code', 'FILE_415')
  })

  it('MSW 기본 응답은 용도별 허용 형식만 받음', async () => {
    const pdf = createFile('certificate.pdf', 'application/pdf')
    const video = createFile('intro.mp4', 'video/mp4')

    await expect(uploadFile(pdf, 'ENROLLMENT_CERT')).resolves.toHaveProperty('fileKey')
    await expect(uploadFile(video, 'APPLICATION_ATTACHMENT')).resolves.toHaveProperty('fileKey')
    await expect(uploadFile(video, 'ENROLLMENT_CERT')).rejects.toHaveProperty(
      'cause.code',
      'FILE_415',
    )
  })

  it('파일 올리기가 실패하면 에러', async () => {
    server.use(
      http.post(PRESIGNED_URL, () =>
        presignedSuccess({
          uploadUrl: UPLOAD_URL,
          fileKey: 'key',
          fileUrl: 'https://cdn.test/key',
        }),
      ),
      http.put(UPLOAD_URL, () => new HttpResponse(null, { status: 403 })),
    )

    await expect(
      uploadFile(createFile('logo.png', 'image/png'), 'ORG_LOGO'),
    ).rejects.toHaveProperty('cause.message', '파일 업로드 실패 (HTTP 403)')
  })

  it('업로드 주소 응답에 필요한 값이 없으면 올리지 않고 에러', async () => {
    let putCount = 0
    server.use(
      http.post(PRESIGNED_URL, () => presignedSuccess({ fileKey: 'key' })),
      http.put(UPLOAD_URL, () => {
        putCount += 1
        return new HttpResponse(null, { status: 200 })
      }),
    )

    await expect(
      uploadFile(createFile('logo.png', 'image/png'), 'ORG_LOGO'),
    ).rejects.toHaveProperty('cause.message', '업로드 주소 응답 형식이 올바르지 않습니다.')
    expect(putCount).toBe(0)
  })

  it('MSW 기본 응답으로 올린 파일은 받은 fileUrl로 다시 조회', async () => {
    const { fileUrl } = await uploadFile(createFile('logo.svg', 'image/svg+xml'), 'ORG_LOGO')
    const response = await fetch(fileUrl)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('image/svg+xml')
  })

  it('시연 모드 MSW는 프로필 사진만 받고 다른 용도는 실제 서버로 넘김', async () => {
    const forwardedPurposes: unknown[] = []
    server.use(
      http.post('*/api/files/presigned-url', async ({ request }) => {
        forwardedPurposes.push(Reflect.get(Object(await request.json()), 'purpose'))
        return HttpResponse.json(
          { success: false, code: 'COMMON_400', message: '없는 용도', data: null },
          { status: 400 },
        )
      }),
    )
    server.use(...profileImageUploadHandlers)

    const { fileUrl } = await uploadFile(createFile('me.png', 'image/png'), 'PROFILE_IMAGE')
    await expect(uploadFile(createFile('logo.png', 'image/png'), 'ORG_LOGO')).rejects.toThrow(
      FileUploadError,
    )

    expect(fileUrl).toContain('profile_image/')
    expect(forwardedPurposes).toEqual(['ORG_LOGO'])
  })
})
