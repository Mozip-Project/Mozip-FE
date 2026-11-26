import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { resetOrganizationProfiles } from '@/features/organization/mocks/organizationProfileHandlers'
import { resetUploadedFiles } from '@/mocks/fileUploadHandlers'
import { graphqlApi } from '@/mocks/graphqlApi'
import { server } from '@/mocks/server'
import { ToastProvider } from '@/providers/toastProvider'
import { OrganizationProfileContent } from './organizationProfileContent'

function renderProfile(savedOrganizationId?: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <OrganizationProfileContent savedOrganizationId={savedOrganizationId} />
      </ToastProvider>
    </QueryClientProvider>,
  )
  return queryClient
}

function failProfileQueryOnce() {
  server.use(
    graphqlApi.query(
      'OrganizationProfile',
      () =>
        HttpResponse.json({
          errors: [{ message: '서버 오류', extensions: { code: 'COMMON_500' } }],
          data: null,
        }),
      { once: true },
    ),
  )
}

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
})

afterEach(() => {
  resetOrganizationProfiles()
  resetUploadedFiles()
  vi.restoreAllMocks()
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('OrganizationProfileContent', () => {
  it('현재 단체의 저장된 프로필로 폼 채움', async () => {
    renderProfile()

    expect(await screen.findByRole('textbox', { name: /한 줄 소개/ })).toHaveValue(
      '사용자 경험을 연구하고 만드는 동아리',
    )
    expect(screen.getByRole('textbox', { name: '단체명' })).toHaveValue('UXUX')
    expect(screen.getByRole('button', { name: '디자인 · 미디어' })).toBeInTheDocument()
    expect(screen.getByText('과학기술연합대학원대학교')).toBeInTheDocument()
    expect(screen.getByText('완료')).toBeInTheDocument()
  })

  it('학생회는 활동 분야 없이 표시', async () => {
    renderProfile('2')

    expect(await screen.findByRole('textbox', { name: '단체명' })).toHaveValue('멋쟁이개발자')
    expect(screen.queryByRole('button', { name: '디자인 · 미디어' })).not.toBeInTheDocument()
    expect(screen.getByText('학생회')).toBeInTheDocument()
    // 연합 단체는 학교 칸 없이 단체 유형·공고 범위·단체 인증만 표시
    expect(screen.getByText('연합')).toBeInTheDocument()
    expect(screen.queryByText('학교')).not.toBeInTheDocument()
    expect(screen.getByText('완료')).toBeInTheDocument()
  })

  it('다시 불러오기가 실패해도 편집 중인 폼과 입력값 유지', async () => {
    const user = userEvent.setup()
    const queryClient = renderProfile()
    const introduction = await screen.findByRole('textbox', { name: /한 줄 소개/ })

    await user.type(introduction, ' 수정')
    failProfileQueryOnce()
    await act(() => queryClient.refetchQueries())

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(introduction).toHaveValue('사용자 경험을 연구하고 만드는 동아리 수정')
  })

  it('새 로고를 골라 저장하면 업로드한 로고로 바뀜', async () => {
    const user = userEvent.setup()
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:new-logo')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    renderProfile()

    await screen.findByRole('img', { name: '현재 로고' })
    const fileInput = document.querySelector<HTMLInputElement>('input[type=file]')
    if (!fileInput) {
      throw new Error('파일 입력 없음')
    }
    await user.upload(fileInput, new File(['logo'], 'new-logo.png', { type: 'image/png' }))
    await user.click(screen.getByRole('button', { name: '저장' }))

    expect(await screen.findByText('단체 프로필을 저장했어요')).toBeInTheDocument()
    expect(await screen.findByRole('img', { name: '현재 로고' })).toHaveAttribute(
      'src',
      expect.stringContaining('org_logo/'),
    )
  })

  it('로고를 바꾸지 않고 저장하면 기존 로고 유지', async () => {
    const user = userEvent.setup()
    renderProfile()
    const savedLogoSrc = (await screen.findByRole('img', { name: '현재 로고' })).getAttribute('src')

    await user.type(screen.getByRole('textbox', { name: /한 줄 소개/ }), ' 수정')
    await user.click(screen.getByRole('button', { name: '저장' }))

    expect(await screen.findByText('단체 프로필을 저장했어요')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '현재 로고' })).toHaveAttribute('src', savedLogoSrc)
  })

  it('로고 없는 단체도 업로드 저장 후 다른 항목만 바꿔 다시 저장 가능', async () => {
    const user = userEvent.setup()
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:new-logo')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    renderProfile('2')
    const introduction = await screen.findByRole('textbox', { name: /한 줄 소개/ })
    const fileInput = document.querySelector<HTMLInputElement>('input[type=file]')
    if (!fileInput) {
      throw new Error('파일 입력 없음')
    }

    await user.upload(fileInput, new File(['logo'], 'logo.png', { type: 'image/png' }))
    await user.type(introduction, '학생회 소개')
    await user.type(screen.getByRole('combobox', { name: /검색 키워드/ }), '학생회{Enter}')
    await user.type(screen.getByRole('textbox', { name: 'SNS/웹사이트 링크' }), 'a.com')
    await user.click(screen.getByRole('button', { name: '저장' }))
    expect(await screen.findByText('단체 프로필을 저장했어요')).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: /한 줄 소개/ }), ' 수정')

    await waitFor(() => expect(screen.getByRole('button', { name: '저장' })).toBeEnabled())
  })

  it('불러오지 못하면 안내 후 다시 시도', async () => {
    const user = userEvent.setup()
    failProfileQueryOnce()
    renderProfile()

    expect(await screen.findByRole('alert')).toHaveTextContent('단체 프로필을 불러오지 못했어요')

    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(await screen.findByRole('textbox', { name: '단체명' })).toHaveValue('UXUX')
  })
})
