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
    <html lang="ko" className={`${pretendard.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
