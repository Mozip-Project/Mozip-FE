import { QueryProvider } from '@/providers/queryProvider'
import { pretendard } from '@/styles/fonts'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MOZIP.',
  description: '동아리 모집 플랫폼',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // scroll-pt-16: 고정 GNB(64px)에 키보드 focus 요소가 가려지는 문제 방지
    <html lang="ko" className={`${pretendard.variable} h-full scroll-pt-16 antialiased`}>
      <body className="flex min-h-full flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
