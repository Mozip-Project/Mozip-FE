import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { AccountSettingsContent } from '@/features/mypage/components/accountSettings/accountSettingsContent'

// TODO: 모드 저장 방식 결정 후 지원자 모드 마이페이지 위치 재결정
export default function AccountSettingsPage() {
  return (
    <div className="flex flex-col gap-gap-l">
      <PageHeader title="계정 설정" />
      <AccountSettingsContent />
    </div>
  )
}
