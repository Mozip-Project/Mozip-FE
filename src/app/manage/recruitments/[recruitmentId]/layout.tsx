import { RecruitmentNav } from '@/features/recruitment/components/recruitmentNav'

export default function RecruitmentLayout({
  children,
}: LayoutProps<'/manage/recruitments/[recruitmentId]'>) {
  return (
    <div className="grid grid-cols-[220px_minmax(0,1fr)] gap-gap-xxl">
      <RecruitmentNav />
      <main className="min-w-0">{children}</main>
    </div>
  )
}
