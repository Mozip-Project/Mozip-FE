import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useImageFilePicker } from './useImageFilePicker'

type PickerProps = {
  onSelect: (file: File) => void
}

function Picker({ onSelect }: PickerProps) {
  const picker = useImageFilePicker(onSelect)

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

function setup() {
  const onSelect = vi.fn()
  // accept로 걸러지기 전 검증 확인용
  const user = userEvent.setup({ applyAccept: false })
  render(<Picker onSelect={onSelect} />)
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
})
