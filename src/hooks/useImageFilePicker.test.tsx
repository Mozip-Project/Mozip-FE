import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useImageFilePicker, type ImageFileRule } from './useImageFilePicker'

type PickerProps = {
  onSelect: (file: File) => void
  fileRule?: ImageFileRule
}

function Picker({ onSelect, fileRule }: PickerProps) {
  const picker = useImageFilePicker(onSelect, fileRule)

  return (
    <>
      <button type="button" onClick={picker.clearError}>
        오류 지우기
      </button>
      <input {...picker.inputProps} data-testid="image-input" />
      {picker.errorMessage && <p role="alert">{picker.errorMessage}</p>}
    </>
  )
}

function createImage(name: string, type: string, sizeBytes = 1024) {
  const file = new File(['image'], name, { type })
  Object.defineProperty(file, 'size', { value: sizeBytes })
  return file
}

function setup(fileRule?: ImageFileRule) {
  const onSelect = vi.fn()
  // accept로 걸러지기 전 검증 확인용
  const user = userEvent.setup({ applyAccept: false })
  render(<Picker onSelect={onSelect} fileRule={fileRule} />)
  return { onSelect, user, input: screen.getByTestId('image-input') }
}

describe('useImageFilePicker', () => {
  it('PNG·JPG 10MB 이하는 선택 전달', async () => {
    const { onSelect, user, input } = setup()
    const file = createImage('profile.png', 'image/png')

    await user.upload(input, file)

    expect(onSelect).toHaveBeenCalledWith(file)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('형식이 다르면 선택 없이 형식 오류 표시', async () => {
    const { onSelect, user, input } = setup()

    await user.upload(input, createImage('profile.gif', 'image/gif'))

    expect(onSelect).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('PNG, JPG 이미지만 업로드 가능해요')
  })

  it('10MB를 넘으면 선택 없이 용량 오류 표시', async () => {
    const { onSelect, user, input } = setup()

    await user.upload(input, createImage('profile.jpg', 'image/jpeg', 10 * 1024 * 1024 + 1))

    expect(onSelect).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('10MB 이하의 이미지만 업로드 가능해요')
  })

  it('올바른 파일을 다시 고르거나 clearError를 부르면 오류 해제', async () => {
    const { user, input } = setup()

    await user.upload(input, createImage('profile.gif', 'image/gif'))
    await user.upload(input, createImage('profile.png', 'image/png'))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    await user.upload(input, createImage('profile.gif', 'image/gif'))
    await user.click(screen.getByRole('button', { name: '오류 지우기' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('화면별 규칙을 넘기면 그 형식·용량·문구로 검사', async () => {
    const { onSelect, user, input } = setup({
      acceptedTypes: ['image/webp'],
      invalidTypeMessage: 'WEBP만 가능해요',
      maxSizeBytes: 5 * 1024 * 1024,
      oversizedMessage: '5MB 이하만 가능해요',
    })

    await user.upload(input, createImage('logo.png', 'image/png'))
    expect(screen.getByRole('alert')).toHaveTextContent('WEBP만 가능해요')

    await user.upload(input, createImage('logo.webp', 'image/webp', 5 * 1024 * 1024 + 1))
    expect(screen.getByRole('alert')).toHaveTextContent('5MB 이하만 가능해요')

    await user.upload(input, createImage('logo.webp', 'image/webp', 5 * 1024 * 1024))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(input).toHaveAttribute('accept', 'image/webp')
  })
})
