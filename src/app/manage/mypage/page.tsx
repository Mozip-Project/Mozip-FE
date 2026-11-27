import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { AccountSettingsContent } from '@/features/mypage/components/accountSettings/accountSettingsContent'

export default function AccountSettingsPage() {
  return (
    <div className="flex flex-col gap-gap-l">
      <PageHeader title="계정 설정" />
      <AccountSettingsContent mode="organizer" />
    </div>
  )
}
