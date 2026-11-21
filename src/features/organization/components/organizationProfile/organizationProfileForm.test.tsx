import { render, screen, waitFor } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { OrganizationProfileFieldsFragment } from '@/gql/graphql'
import { OrganizationProfileForm } from './organizationProfileForm'

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
  const { container } = render(
    <OrganizationProfileForm
      organization={{ ...organization, type: isStudentCouncil ? 'STUDENT_COUNCIL' : 'CLUB' }}
    />,
  )
  return container
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
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:logo')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
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
    await waitFor(() => expect(saveButton).toBeDisabled())
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
