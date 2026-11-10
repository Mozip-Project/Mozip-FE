import { Button } from '@/components/ui/Button/button'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'

export default function ProfileEditPage() {
  return (
    <PageHeader
      title="정보 수정"
      actions={<Button size="m">저장</Button>}
      backLink={{ href: '/manage/mypage', label: '계정 설정' }}
    />
  )
}
