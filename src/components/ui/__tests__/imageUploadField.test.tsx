import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ImageUploadField } from '@/components/ui/ImageUploadField/imageUploadField'

describe('ImageUploadField', () => {
  it('업로드·초기화 버튼을 label 이름의 묶음으로 연결', () => {
    render(
      <ImageUploadField
        value={null}
        onChange={() => undefined}
        label="프로필 이미지"
        title={<h2>프로필</h2>}
      />,
    )

    expect(screen.getByRole('group', { name: '프로필 이미지' })).toContainElement(
      screen.getByRole('button', { name: '이미지 업로드' }),
    )
  })
})
