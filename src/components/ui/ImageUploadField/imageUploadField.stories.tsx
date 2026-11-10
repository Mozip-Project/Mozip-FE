import { useState } from 'react'
import { ImageUploadField } from './imageUploadField'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/ImageUploadField',
  component: ImageUploadField,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof ImageUploadField>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

function ControlledImageUploadField() {
  const [image, setImage] = useState<File | null>(null)

  return (
    <ImageUploadField
      value={image}
      onChange={setImage}
      label="프로필 이미지"
      title={<h2 className="text-headline1 font-semibold text-neutral">프로필</h2>}
    />
  )
}

export const Default: Story = {
  render: () => <ControlledImageUploadField />,
}
