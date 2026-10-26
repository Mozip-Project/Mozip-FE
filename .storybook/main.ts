import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'
import type { StorybookConfig } from '@storybook/nextjs-vite'

// next.config.ts의 SVGR 대상과 같은 범위 유지
const ICON_SVG_PATTERN = '**/src/assets/icons/*.svg'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [],
  framework: {
    name: '@storybook/nextjs-vite',
    // next/image 처리에서 아이콘 SVG 제외해 svgr과의 충돌 방지
    options: { image: { excludeFiles: [ICON_SVG_PATTERN] } },
  },
  async viteFinal(config) {
    const { mergeConfig } = await import('vite')
    return mergeConfig(config, {
      plugins: [tailwindcss(), svgr({ include: ICON_SVG_PATTERN })],
    })
  },
}
export default config
