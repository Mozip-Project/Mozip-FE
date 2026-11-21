import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { delay, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetOrganizationProfiles } from '@/features/organization/mocks/organizationProfileHandlers'
import type { OrganizationProfileFieldsFragment } from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { server } from '@/mocks/server'
import { ToastProvider } from '@/providers/toastProvider'
import { OrganizationProfileForm } from './organizationProfileForm'

// 저장 중 상태를 확인할 수 있게 응답을 늦춘 뒤 기본 handler로 넘김
const SLOW_SAVE_DELAY_MS = 100

// 아직 아무것도 저장하지 않은 단체
const EMPTY_ORGANIZATION: OrganizationProfileFieldsFragment = {
  id: '1',
  name: '샘플 단체',
  type: 'CLUB',
  logoUrl: null,
  tagline: null,
  fields: [],
  keywords: [],
  links: [],
}

function renderForm(isStudentCouncil: boolean, organization = EMPTY_ORGANIZATION) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const { container } = render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <OrganizationProfileForm
          organization={{ ...organization, type: isStudentCouncil ? 'STUDENT_COUNCIL' : 'CLUB' }}
        />
      </ToastProvider>
    </QueryClientProvider>,
  )
  return container
}

function failUpdateOnce(extensions: Record<string, unknown>) {
  server.use(
    graphqlApi.mutation(
      'UpdateOrganization',
      () => HttpResponse.json({ errors: [{ message: '저장 실패', extensions }], data: null }),
      { once: true },
    ),
  )
}

async function fillRequiredWithoutCategories(user: UserEvent, container: HTMLElement) {
  const fileInput = container.querySelector<HTMLInputElement>('input[type=file]')

  if (!fileInput) {
    throw new Error('파일 입력 없음')
  }

  await user.upload(fileInput, new File(['logo'], 'logo.png', { type: 'image/png' }))
  await user.type(screen.getByRole('textbox', { name: /한 줄 소개/ }), '디자인 동아리')
  await user.type(screen.getByRole('combobox', { name: /검색 키워드/ }), 'UX{Enter}')
  await user.type(screen.getByRole('textbox', { name: 'SNS/웹사이트 링크' }), 'instagram.com/a')
}

describe('OrganizationProfileForm', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:logo')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    resetOrganizationProfiles()
  })

  it('학생회 외는 활동 분야까지 선택해야 저장 활성', async () => {
    const user = userEvent.setup()
    const container = renderForm(false)
    const saveButton = screen.getByRole('button', { name: '저장' })

    expect(saveButton).toBeDisabled()

    await fillRequiredWithoutCategories(user, container)
    expect(saveButton).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'IT · 개발' }))
    await waitFor(() => expect(saveButton).toBeEnabled())
  })

  it('학생회는 활동 분야 없이 저장 활성, 비운 링크 입력란이 있으면 비활성', async () => {
    const user = userEvent.setup()
    const container = renderForm(true)
    const saveButton = screen.getByRole('button', { name: '저장' })

    await fillRequiredWithoutCategories(user, container)
    await waitFor(() => expect(saveButton).toBeEnabled())

    await user.click(screen.getByRole('button', { name: '링크 추가' }))
    await waitFor(() => expect(saveButton).toBeDisabled())
  })

  it('저장하면 저장한 값이 기준이 되어 다시 비활성', async () => {
    const user = userEvent.setup()
    const container = renderForm(true)
    const saveButton = screen.getByRole('button', { name: '저장' })

    await fillRequiredWithoutCategories(user, container)
    await waitFor(() => expect(saveButton).toBeEnabled())

    await user.click(saveButton)

    // 저장 중에도 비활성이라 완료 후 저장값이 새 기준이 됐는지 확인
    expect(await screen.findByText('단체 프로필을 저장했어요')).toBeInTheDocument()
    expect(saveButton).toBeDisabled()
  })

  it('저장하면 완료 안내, 링크는 https가 붙은 저장값으로 바뀜', async () => {
    const user = userEvent.setup()
    const container = renderForm(true)

    await fillRequiredWithoutCategories(user, container)
    await user.click(screen.getByRole('button', { name: '저장' }))

    expect(await screen.findByText('단체 프로필을 저장했어요')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'SNS/웹사이트 링크' })).toHaveValue(
      'https://instagram.com/a',
    )
  })

  it('저장 중에는 입력을 잠그고 끝나면 다시 편집 가능', async () => {
    const user = userEvent.setup()
    const container = renderForm(true)
    server.use(
      graphqlApi.mutation(
        'UpdateOrganization',
        async () => {
          await delay(SLOW_SAVE_DELAY_MS)
          return undefined
        },
        { once: true },
      ),
    )

    await fillRequiredWithoutCategories(user, container)
    await user.click(screen.getByRole('button', { name: '저장' }))

    const introduction = screen.getByRole('textbox', { name: /한 줄 소개/ })
    await waitFor(() => expect(introduction).toBeDisabled())
    expect(await screen.findByText('단체 프로필을 저장했어요')).toBeInTheDocument()
    expect(introduction).toBeEnabled()
  })

  it('서버 입력 오류는 해당 입력에 표시하고 포커스 이동', async () => {
    const user = userEvent.setup()
    const container = renderForm(true)
    failUpdateOnce({
      code: 'ORG_400',
      fieldErrors: [{ field: 'tagline', message: '한 줄 소개를 확인해 주세요.' }],
    })

    await fillRequiredWithoutCategories(user, container)
    await user.click(screen.getByRole('button', { name: '저장' }))

    const introduction = screen.getByRole('textbox', { name: /한 줄 소개/ })
    expect(await screen.findByText('한 줄 소개를 확인해 주세요.')).toBeInTheDocument()
    expect(introduction).toHaveAttribute('aria-invalid', 'true')
    expect(introduction).toHaveFocus()
  })

  it('그 밖의 저장 실패는 안내 후 다시 저장 가능', async () => {
    const user = userEvent.setup()
    const container = renderForm(true)
    failUpdateOnce({ code: 'COMMON_500' })

    await fillRequiredWithoutCategories(user, container)
    await user.click(screen.getByRole('button', { name: '저장' }))

    expect(await screen.findByText('단체 프로필을 저장하지 못했어요')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '저장' })).toBeEnabled()
  })

  it('저장된 값으로 채워지고, 저장된 로고가 있으면 바꾼 항목만으로 저장 활성', async () => {
    const user = userEvent.setup()
    renderForm(false, {
      ...EMPTY_ORGANIZATION,
      logoUrl: 'https://example.com/logo.png',
      tagline: '디자인 동아리',
      fields: ['DESIGN_MEDIA'],
      keywords: ['UX'],
      links: [{ id: 'link-1', url: 'https://instagram.com/a' }],
    })
    const introduction = screen.getByRole('textbox', { name: /한 줄 소개/ })
    const saveButton = screen.getByRole('button', { name: '저장' })

    expect(introduction).toHaveValue('디자인 동아리')
    expect(screen.getByRole('img', { name: '현재 로고' })).toBeInTheDocument()
    expect(saveButton).toBeDisabled()

    await user.type(introduction, '입니다')

    await waitFor(() => expect(saveButton).toBeEnabled())
  })

  it('한 줄 소개가 최대 글자수에 도달하면 안내 문구 표시', async () => {
    const user = userEvent.setup()
    renderForm(true)
    const introduction = screen.getByRole('textbox', { name: /한 줄 소개/ })

    await user.type(introduction, '가'.repeat(39))
    expect(screen.queryByText('최대 40자까지 입력할 수 있어요')).not.toBeInTheDocument()

    await user.type(introduction, '나다')

    expect(introduction).toHaveValue(`${'가'.repeat(39)}나`)
    expect(introduction).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('최대 40자까지 입력할 수 있어요')).toBeInTheDocument()
  })
})
