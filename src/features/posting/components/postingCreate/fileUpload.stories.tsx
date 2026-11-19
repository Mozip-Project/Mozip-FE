import { FileUpload } from './fileUpload'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Features/Posting/FileUpload',
  component: FileUpload,
  parameters: { layout: 'padded' },
  args: {
    acceptedTypes: ['application/pdf'],
    maxSizeBytes: 20 * 1024 * 1024,
    description: 'PDF 파일, 20MB 이하',
    className: 'w-235',
    onFileSelect: () => undefined,
    onReject: () => undefined,
  },
} satisfies Meta<typeof FileUpload>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
