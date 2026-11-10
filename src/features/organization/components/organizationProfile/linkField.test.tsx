import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import type { OrganizationProfileValues } from '@/features/organization/schemas/organizationProfileSchema'
import { LinkField } from './linkField'

function FormLinkField() {
  const { control } = useForm<OrganizationProfileValues>({
    defaultValues: { links: [{ url: '' }] },
  })
  return <LinkField control={control} />
}

describe('LinkField', () => {
  it('링크가 하나면 삭제 버튼 없음', () => {
    render(<FormLinkField />)

    expect(screen.getByRole('textbox', { name: 'SNS/웹사이트 링크' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /링크 삭제/ })).not.toBeInTheDocument()
  })

  it('링크 추가 시 새 입력란으로 포커스, 모든 입력란에 삭제 버튼 표시', async () => {
    const user = userEvent.setup()
    render(<FormLinkField />)

    await user.click(screen.getByRole('button', { name: '링크 추가' }))

    expect(screen.getByRole('textbox', { name: 'SNS/웹사이트 링크 2' })).toHaveFocus()
    expect(screen.getAllByRole('button', { name: /링크 삭제/ })).toHaveLength(2)
  })

  it('삭제 시 입력값을 유지한 채 해당 링크만 제거하고 이전 입력란으로 포커스', async () => {
    const user = userEvent.setup()
    render(<FormLinkField />)

    await user.type(screen.getByRole('textbox', { name: 'SNS/웹사이트 링크' }), 'instagram.com/a')
    await user.click(screen.getByRole('button', { name: '링크 추가' }))
    await user.click(screen.getByRole('button', { name: '2번째 링크 삭제' }))

    const firstInput = screen.getByRole('textbox', { name: 'SNS/웹사이트 링크' })
    expect(firstInput).toHaveValue('instagram.com/a')
    expect(firstInput).toHaveFocus()
    expect(screen.queryByRole('button', { name: /링크 삭제/ })).not.toBeInTheDocument()
  })
})
