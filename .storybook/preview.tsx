import '../src/app/globals.css'
import { pretendard } from '../src/styles/fonts'
import type { Preview } from '@storybook/nextjs-vite'

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  // 스토리는 root layout을 거치지 않아 폰트 변수를 직접 적용
  decorators: [
    (Story) => (
      <div className={`${pretendard.variable} font-sans antialiased`}>
        <Story />
      </div>
    ),
  ],
}

export default preview
