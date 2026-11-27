import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { MyApplicationList } from '@/features/recruitment/components/applicant/myApplicationList/myApplicationList'

export default function ApplicationsPage() {
  return (
    <main className="flex flex-col gap-12">
      <PageHeader title="내 지원" />
      <MyApplicationList />
    </main>
  )
}
