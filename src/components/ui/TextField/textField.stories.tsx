import { TextField } from './textField'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/TextField',
  component: TextField,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof TextField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-gap-xl">
      <TextField className="w-90" label="이름" placeholder="이름을 입력하세요" />
      <TextField
        className="w-90"
        label="이름"
        placeholder="이름을 입력하세요"
        defaultValue="홍길동"
      />
      <TextField
        className="w-90"
        label="이름"
        placeholder="이름을 입력하세요"
        defaultValue="홍길동"
        aria-invalid
      />
      <TextField className="w-90" label="이름" placeholder="이름을 입력하세요" disabled />
    </div>
  ),
}

// Figma TextField의 Required·Helper 대응
export const RequiredWithHelper: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-gap-xl">
      <TextField
        className="w-90"
        label="라벨"
        helper="도움말 텍스트"
        placeholder="이름을 입력하세요"
        required
      />
      <TextField
        className="w-90"
        label="라벨"
        helper="도움말 텍스트"
        placeholder="이름을 입력하세요"
        defaultValue="홍길동"
        required
      />
      <TextField
        className="w-90"
        label="라벨"
        helper="도움말 텍스트"
        placeholder="이름을 입력하세요"
        defaultValue="홍길동"
        required
        aria-invalid
      />
      <TextField
        className="w-90"
        label="라벨"
        helper="도움말 텍스트"
        placeholder="이름을 입력하세요"
        required
        disabled
      />
    </div>
  ),
}

export const DisabledFieldset: Story = {
  render: () => (
    <fieldset disabled className="grid grid-cols-2 gap-gap-xl">
      <TextField className="w-90" label="라벨" placeholder="이름을 입력하세요" />
      <TextField
        className="w-90"
        label="라벨"
        placeholder="이름을 입력하세요"
        defaultValue="홍길동"
      />
    </fieldset>
  ),
}
