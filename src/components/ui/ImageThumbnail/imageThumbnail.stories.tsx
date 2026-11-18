import { ImageThumbnail } from './imageThumbnail'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const SAMPLE_IMAGE_SRC = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="212" height="212"><rect width="212" height="212" fill="#c8cfda"/><circle cx="106" cy="106" r="48" fill="#9ea7b9"/></svg>',
)}`

const meta = {
  title: 'UI/ImageThumbnail',
  component: ImageThumbnail,
  parameters: { layout: 'padded' },
  args: { src: SAMPLE_IMAGE_SRC, alt: '공고 이미지 1', onRemove: () => undefined },
} satisfies Meta<typeof ImageThumbnail>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
