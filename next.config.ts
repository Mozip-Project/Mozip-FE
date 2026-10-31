import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  typedRoutes: true,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
      '*.svg': {
        // 경로 glob 규칙에서 next build 시 SVG가 객체로 들어와 RegExp 사용
        condition: { path: /src\/assets\/icons\// },
        // SVGO의 viewBox 제거로 크기를 줄인 아이콘이 잘리는 문제 방지
        loaders: [{ loader: '@svgr/webpack', options: { svgo: false } }],
        as: '*.js',
      },
    },
  },
}

export default nextConfig
