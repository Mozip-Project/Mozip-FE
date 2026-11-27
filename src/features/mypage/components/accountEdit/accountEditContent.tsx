'use client'

import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { MY_PAGE_PATHS, type MyPageMode } from '@/features/mypage/utils/myPageRoutes'
import { OrganizationLoadError } from '@/features/organization/components/organizationLoadError/organizationLoadError'
import { useMyAccountQuery } from '@/features/user/api/queries'
import { maskPhoneNumber } from '@/utils/phone'
import { AccountEditForm } from './accountEditForm'
import { AccountEditSkeleton } from './accountEditSkeleton'

type AccountEditContentProps = {
  mode: MyPageMode
}

// 폼 초깃값이 첫 렌더링에만 적용되어 계정 정보를 받은 뒤 폼 표시
function AccountEditContent({ mode }: AccountEditContentProps) {
  const accountQuery = useMyAccountQuery()
  const account = accountQuery.data
  const backLink = { href: MY_PAGE_PATHS[mode].accountSettings, label: '계정 설정' }

  // 번호를 저장하면 초깃값만 쓰는 현재 번호 칸까지 새로 그리도록 번호를 key로 사용
  if (account) {
    return (
      <AccountEditForm
        key={account.phone}
        name={account.name}
        maskedPhone={maskPhoneNumber(account.phone)}
        profileImageUrl={account.profileImageUrl}
        backLink={backLink}
      />
    )
  }
  if (accountQuery.isError) {
    return (
      <div className="flex flex-col gap-gap-l">
        <PageHeader title="정보 수정" backLink={backLink} />
        <OrganizationLoadError
          message="계정 정보를 불러오지 못했어요"
          onRetry={() => void accountQuery.refetch()}
        />
      </div>
    )
  }
  return <AccountEditSkeleton backLink={backLink} />
}

export { AccountEditContent }
