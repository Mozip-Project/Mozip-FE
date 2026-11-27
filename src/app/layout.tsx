import { Suspense } from 'react'
import { ScenarioTracker } from '@/features/analytics/components/scenarioTracker'
import { MockProvider } from '@/providers/mockProvider'
import { QueryProvider } from '@/providers/queryProvider'
import { pretendard } from '@/styles/fonts'
import type { Metadata } from 'next'
import './globals.css'

const SITE_NAME = 'mozip.'
const SITE_DESCRIPTION = '모집의 처음부터 끝까지 한 곳에서'

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
  },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full page-scroll-padding antialiased`}>
      <body className="flex min-h-full flex-col">
        <MockProvider>
          <QueryProvider>{children}</QueryProvider>
        </MockProvider>
        {/* 주소의 단계 값을 읽어 정적 렌더링 경계 필요 */}
        <Suspense>
          <ScenarioTracker />
        </Suspense>
      </body>
    </html>
  )
}
