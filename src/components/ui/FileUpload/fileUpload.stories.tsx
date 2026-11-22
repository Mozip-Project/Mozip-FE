import { FileUpload } from './fileUpload'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const MAX_SIZE_BYTES = 10 * 1024 * 1024

const meta = {
  title: 'UI/FileUpload',
  component: FileUpload,
  parameters: { layout: 'padded' },
  args: {
    acceptedTypes: ['application/pdf', 'image/jpeg'],
    maxSizeBytes: MAX_SIZE_BYTES,
    description: '파일당 10MB 이하',
    onFileSelect: () => {},
    onReject: () => {},
  },
  decorators: [
    (Story) => (
      <div className="max-w-195">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FileUpload>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
