import { MyPageNav } from '@/features/mypage/components/myPageNav'

export default function MyPageLayout({ children }: LayoutProps<'/manage/mypage'>) {
  return (
    <div className="grid grid-cols-[220px_minmax(0,1fr)] gap-12">
      <MyPageNav />
      <main className="min-w-0">{children}</main>
    </div>
  )
}
