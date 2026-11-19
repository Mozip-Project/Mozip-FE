import { ImageThumbnail } from './imageThumbnail'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const SAMPLE_IMAGE_SRC = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><defs><pattern id="c" width="32" height="32" patternUnits="userSpaceOnUse"><rect width="32" height="32" fill="#fafafa"/><rect x="16" width="16" height="16" fill="#ebebeb"/><rect y="16" width="16" height="16" fill="#ebebeb"/></pattern></defs><rect width="256" height="256" fill="url(#c)"/></svg>',
)}`

const meta = {
  title: 'Features/Posting/ImageThumbnail',
  component: ImageThumbnail,
  parameters: { layout: 'padded' },
  args: { src: SAMPLE_IMAGE_SRC, alt: '공고 이미지 1', onRemove: () => undefined },
} satisfies Meta<typeof ImageThumbnail>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
