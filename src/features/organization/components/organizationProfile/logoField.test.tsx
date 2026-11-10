import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LogoField } from './logoField'

function ControlledLogoField() {
  const [logo, setLogo] = useState<File | null>(null)
  return <LogoField value={logo} onChange={setLogo} />
}

const PREVIEW_URL = 'blob:logo-preview'

describe('LogoField', () => {
  const revokeObjectURL = vi.fn()

  beforeEach(() => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue(PREVIEW_URL)
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(revokeObjectURL)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    revokeObjectURL.mockClear()
  })

  it('이미지 업로드 전에는 초기화 버튼 없음', () => {
    render(<ControlledLogoField />)

    expect(screen.queryByRole('button', { name: '초기화' })).not.toBeInTheDocument()
  })

  it('이미지 선택 시 미리보기 표시, 초기화 시 기본 상태로 복귀', async () => {
    const user = userEvent.setup()
    const { container } = render(<ControlledLogoField />)
    const fileInput = container.querySelector<HTMLInputElement>('input[type=file]')

    if (!fileInput) {
      throw new Error('파일 입력 없음')
    }

    await user.upload(fileInput, new File(['logo'], 'logo.png', { type: 'image/png' }))

    expect(screen.getByRole('img', { name: '선택한 로고' })).toHaveAttribute('src', PREVIEW_URL)

    const resetButton = screen.getByRole('button', { name: '초기화' })
    await user.click(resetButton)

    expect(screen.queryByRole('img', { name: '선택한 로고' })).not.toBeInTheDocument()
    expect(resetButton).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '이미지 업로드' })).toHaveFocus()
    expect(revokeObjectURL).toHaveBeenCalledWith(PREVIEW_URL)
  })

  it('10MB를 넘는 파일은 반영하지 않고 안내 문구 표시', async () => {
    const user = userEvent.setup()
    const { container } = render(<ControlledLogoField />)
    const fileInput = container.querySelector<HTMLInputElement>('input[type=file]')

    if (!fileInput) {
      throw new Error('파일 입력 없음')
    }

    const largeFile = new File(['logo'], 'large.png', { type: 'image/png' })
    Object.defineProperty(largeFile, 'size', { value: 10 * 1024 * 1024 + 1 })
    await user.upload(fileInput, largeFile)

    expect(screen.getByRole('alert')).toHaveTextContent('10MB 이하의 이미지만 업로드 가능해요')
    expect(screen.queryByRole('img', { name: '선택한 로고' })).not.toBeInTheDocument()

    await user.upload(fileInput, new File(['logo'], 'logo.png', { type: 'image/png' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: '선택한 로고' })).toBeInTheDocument()
  })
})
