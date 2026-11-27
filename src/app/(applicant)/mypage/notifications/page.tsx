import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { NotificationSettings } from '@/features/notification/components/notificationSettings/notificationSettings'

export default function NotificationSettingsPage() {
  return (
    <div className="flex flex-col gap-gap-xl">
      <PageHeader title="알림 설정" />
      <NotificationSettings />
    </div>
  )
}
