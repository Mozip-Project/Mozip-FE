import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { resetMyAccount } from '@/features/user/mocks/userHandlers'
import { resetUploadedFiles } from '@/mocks/fileUploadHandlers'
import { graphqlApi } from '@/mocks/graphqlApi'
import { server } from '@/mocks/server'
import { ToastProvider } from '@/providers/toastProvider'
import { AccountEditContent } from './accountEditContent'

function renderAccountEdit() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AccountEditContent />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
})

afterEach(() => {
  resetMyAccount()
  resetUploadedFiles()
  vi.restoreAllMocks()
})

function getFileInput() {
  const fileInput = document.querySelector<HTMLInputElement>('input[type=file]')
  if (!fileInput) {
    throw new Error('파일 입력 없음')
  }
  return fileInput
}

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('AccountEditContent', () => {
  it('내 계정 정보로 이름과 가린 현재 번호를 채움', async () => {
    renderAccountEdit()

    expect(await screen.findByRole('textbox', { name: /이름/ })).toHaveValue('김모집')
    expect(screen.getByDisplayValue('010-****-5678')).toBeInTheDocument()
  })

  it('불러오기에 실패하면 다시 시도로 계정 정보를 다시 불러옴', async () => {
    server.use(
      graphqlApi.query(
        'MyAccount',
        () =>
          HttpResponse.json({
            errors: [{ message: '서버 오류', extensions: { code: 'COMMON_500' } }],
            data: null,
          }),
        { once: true },
      ),
    )
    renderAccountEdit()

    expect(await screen.findByRole('alert')).toHaveTextContent('계정 정보를 불러오지 못했어요')
    expect(screen.getByRole('link', { name: '계정 설정' })).toHaveAttribute(
      'href',
      '/manage/mypage',
    )

    await userEvent.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(await screen.findByRole('textbox', { name: /이름/ })).toHaveValue('김모집')
  })

  it('프로필 이미지만 바꿔 저장하면 올린 이미지가 현재 프로필 이미지가 됨', async () => {
    const user = userEvent.setup()
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:new-profile')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    renderAccountEdit()
    await screen.findByRole('textbox', { name: /이름/ })

    await user.upload(getFileInput(), new File(['me'], 'me.png', { type: 'image/png' }))
    await user.click(screen.getByRole('button', { name: '저장' }))

    expect(await screen.findByText('정보를 저장했어요')).toBeInTheDocument()
    expect(await screen.findByRole('img', { name: '현재 프로필 이미지' })).toHaveAttribute(
      'src',
      expect.stringContaining('profile_image/'),
    )
  })

  it('프로필 이미지를 올리지 못하면 아무것도 저장하지 않고 안내', async () => {
    const user = userEvent.setup()
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:new-profile')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    let updateProfileCount = 0
    server.use(
      http.post('*/api/files/presigned-url', () =>
        HttpResponse.json(
          { success: false, code: 'FILE_413', message: '용량 초과', data: null },
          { status: 413 },
        ),
      ),
      graphqlApi.mutation('UpdateProfile', () => {
        updateProfileCount += 1
      }),
    )
    renderAccountEdit()
    const nameInput = await screen.findByRole('textbox', { name: /이름/ })

    await user.clear(nameInput)
    await user.type(nameInput, '이모집')
    await user.upload(getFileInput(), new File(['me'], 'me.png', { type: 'image/png' }))
    await user.click(screen.getByRole('button', { name: '저장' }))

    expect(await screen.findByText('프로필 이미지를 올리지 못했어요')).toBeInTheDocument()
    expect(updateProfileCount).toBe(0)
    expect(nameInput).toHaveValue('이모집')
  })
})
